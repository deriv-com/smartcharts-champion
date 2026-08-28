import { ActionSheet, Modal } from '@deriv-com/quill-ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useStores } from 'src/store';
import '../../sass/components/_quill-dialogs.scss';

const PORTAL_ID = 'smartcharts-quill-portal';

/**
 * Quill portals to `document.getElementById(portalId)`, so the dialog lands outside the
 * `.smartcharts-{theme}` wrapper and outside any stacking context the chart creates.
 *
 * We therefore own a body-level container and stamp the chart's theme onto it. Quill's
 * design tokens are CSS custom properties declared on `html.light` / `html.dark`; because
 * custom properties inherit, re-declaring the handful this dialog consumes on the container
 * overrides them for the whole subtree. That keeps the dialog matching `settings.theme` even
 * if the host app's `<html>` class disagrees (see _quill-dialogs.scss).
 */
const useQuillPortal = (theme: string, isMobile?: boolean) => {
    const [node, setNode] = React.useState<HTMLElement | null>(null);

    React.useEffect(() => {
        let el = document.getElementById(PORTAL_ID);
        if (!el) {
            el = document.createElement('div');
            el.id = PORTAL_ID;
            document.body.appendChild(el);
        }
        setNode(el);
    }, []);

    React.useEffect(() => {
        if (!node) return;
        // The device class matters as much as the theme: SmartCharts' stylesheets key
        // responsive rules off `.smartcharts-mobile`, and the portal sits outside the
        // chart's own wrapper, so it has to carry both itself.
        node.className = classNames('smartcharts-quill-portal', `smartcharts-${theme}`, {
            'smartcharts-mobile': isMobile,
            'smartcharts-desktop': !isMobile,
        });
    }, [node, theme, isMobile]);

    return node;
};

type TDialogShellProps = {
    open: boolean;
    onClose: () => void;
    /** Rendered as the sheet header on mobile. Desktop titles are drawn by each dialog's body. */
    mobileTitle?: string;
    className?: string;
    children?: React.ReactNode;
};

/**
 * `DialogStore` closes the active dialog from a document-level click listener unless the
 * event is stamped `isHandledByDialog` - the flag the legacy `Dialog` component set on its
 * container. Quill's desktop Modal happens to survive because it calls `stopPropagation()`
 * on its container, but the ActionSheet does not, so on mobile *any* tap inside the sheet
 * (even inert text) dismissed it.
 *
 * Stamping here restores the contract for both surfaces and stops desktop depending on a
 * quill implementation detail. `display: contents` keeps the wrapper out of the layout while
 * still carrying the event - propagation follows the DOM tree, not the box tree.
 */
const markHandled = (e: React.MouseEvent) => {
    (e.nativeEvent as unknown as { isHandledByDialog?: boolean }).isHandledByDialog = true;
};

const DialogSurface = ({ children }: { children?: React.ReactNode }) => (
    <div style={{ display: 'contents' }} onClickCapture={markHandled}>
        {children}
    </div>
);

const DialogShell = ({ open, onClose, mobileTitle, className, children }: TDialogShellProps) => {
    const { chart, chartSetting } = useStores();
    const { isMobile } = chart;
    const portalNode = useQuillPortal(chartSetting.theme, isMobile);

    // Nothing to portal into yet (first paint) — render nothing rather than let quill
    // fall back to `#modal-root` / `document.body`, which would skip our theme scope.
    if (!portalNode) return null;

    if (isMobile) {
        return (
            <ActionSheet.Root isOpen={open} onClose={onClose} expandable={false} position='left'>
                <ActionSheet.Portal showHandlebar shouldCloseOnDrag portalId={PORTAL_ID}>
                    <DialogSurface>
                        {mobileTitle && <ActionSheet.Header title={mobileTitle} />}
                        <ActionSheet.Content className={classNames('sc-quill-dialog', className)}>
                            {children}
                        </ActionSheet.Content>
                    </DialogSurface>
                </ActionSheet.Portal>
            </ActionSheet.Root>
        );
    }

    return (
        <Modal
            isOpened={open}
            toggleModal={onClose}
            showCrossIcon
            hasFooter={false}
            portalId={PORTAL_ID}
            className={classNames('sc-quill-dialog', className)}
        >
            <DialogSurface>{children}</DialogSurface>
        </Modal>
    );
};

export default observer(DialogShell);

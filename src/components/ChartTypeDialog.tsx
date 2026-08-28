import { Chip, Tooltip as QuillTooltip } from '@deriv-com/quill-ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Intervals, STATE } from 'src/Constant';
import { useStores } from 'src/store';
import { INTERVALS_PER_ROW, TIntervalOption } from 'src/store/TimeperiodStore';
import { ChartType, TGranularity } from 'src/types';
import { getTimeIntervalName } from 'src/utils';
import DialogShell from './DialogShell';

type TChartTypeDialogProps = {
    onChartType?: (chartType?: string) => void;
    onGranularity?: (granularity?: TGranularity) => void;
};

const chunk = <T,>(items: T[], size: number): T[][] =>
    items.reduce<T[][]>((rows, item, i) => {
        if (i % size === 0) rows.push([]);
        rows[rows.length - 1].push(item);
        return rows;
    }, []);

/**
 * One grid cell. Disabled cells hover to explain *why* they are disabled; enabled ones
 * are plain. Both branches render a wrapper carrying the same `className`, so swapping a
 * tooltip in never changes the flex layout - without that, tooltip-wrapped cells collapse
 * while their unwrapped siblings stretch.
 *
 * Tooltips are suppressed on mobile, where there is no hover.
 */
const Slot = ({
    reason,
    show,
    className,
    children,
}: {
    reason?: string;
    show: boolean;
    className: string;
    children: React.ReactNode;
}) => {
    if (show && reason) {
        return (
            <QuillTooltip as='div' className={className} tooltipContent={reason} tooltipPosition='top' hasArrow>
                {children}
            </QuillTooltip>
        );
    }
    return <div className={className}>{children}</div>;
};

const ChartTypeTile = observer(
    ({
        chartType,
        onSelect,
    }: {
        chartType: ChartType & { active?: boolean; disabled?: boolean };
        onSelect: (t: ChartType) => void;
    }) => {
        const Icon = chartType.icon;
        return (
            <div
                className={classNames('sc-chart-type-dialog__tile', {
                    'sc-chart-type-dialog__tile--active': chartType.active,
                    'sc-chart-type-dialog__tile--disabled': chartType.disabled,
                })}
                role='button'
                tabIndex={chartType.disabled ? -1 : 0}
                aria-disabled={chartType.disabled}
                aria-pressed={chartType.active}
                onClick={() => !chartType.disabled && onSelect(chartType)}
                onKeyDown={e => {
                    if (chartType.disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(chartType);
                    }
                }}
            >
                {Icon && <Icon />}
                <span className='sc-chart-type-dialog__tile__label'>{t.translate(chartType.text)}</span>
            </div>
        );
    }
);

/**
 * Everything that reacts to a selection lives here, deliberately *below* `DialogShell`.
 *
 * quill's Modal declares its content component inside its own render body and mounts it as
 * `jsx(q, {})`, so `q` gets a fresh identity on every Modal render and React tears down the
 * whole subtree - the icons visibly flash. Keeping the observable reads in this inner
 * component means picking a chart type never re-renders the shell, so the Modal is left
 * alone and only this content updates.
 */
const ChartTypeDialogBody = observer(({ onChartType, onGranularity }: TChartTypeDialogProps) => {
    const { chart, chartType, timeperiod, state, loader } = useStores();
    const { isMobile } = chart;
    const { isActive: isLoading } = loader;
    const { types, type, setChartType, updateProps: updateChartTypeProps } = chartType;
    const { intervals, changeGranularity, setGranularity, updateProps: updateIntervalProps } = timeperiod;

    const onChartTypeChange = onChartType || setChartType;
    const onGranularityChange = onGranularity || setGranularity;

    React.useEffect(() => {
        updateChartTypeProps(onChartTypeChange);
        updateIntervalProps(onGranularityChange);
    });

    // Selecting does NOT dismiss the dialog: chart type and interval are commonly changed
    // together, and each choice is reflected live behind the overlay. The user closes it
    // when they're done, via the close button, the overlay, Escape or a swipe down.
    const onSelectChartType = (selected: ChartType) => {
        if (isLoading || selected.disabled || type?.id === selected.id) return;
        if (selected.id) {
            state.stateChange(STATE.CHART_TYPE_CHANGE, {
                chart_type_name: selected.text.toLowerCase(),
                time_interval_name: getTimeIntervalName(state.granularity, Intervals),
            });
        }
        onChartTypeChange(selected.id);
    };

    const onSelectInterval = (option: TIntervalOption) => {
        if (isLoading || option.disabled || option.active) return;
        changeGranularity(option.interval);
    };

    // Tooltips explain disabled options; there is no hover on touch, and a spinner
    // already communicates "busy", so suppress them in both cases.
    const showTooltips = !isMobile && !isLoading;

    return (
        <div className='sc-chart-type-dialog__content'>
            <section className='sc-chart-type-dialog__section'>
                <h2 className='sc-quill-dialog__heading'>{t.translate('Chart type')}</h2>
                <div className='sc-chart-type-dialog__types'>
                    {types.map(item => (
                        <Slot
                            key={item.id}
                            className='sc-chart-type-dialog__tile-slot'
                            reason={item.disabledReason}
                            show={showTooltips && !!item.disabled}
                        >
                            <ChartTypeTile chartType={item} onSelect={onSelectChartType} />
                        </Slot>
                    ))}
                </div>
            </section>

            <div className='sc-quill-dialog__divider' />

            <section className='sc-chart-type-dialog__section'>
                <h2 className='sc-quill-dialog__heading'>{t.translate('Time interval')}</h2>
                <div className='sc-chart-type-dialog__intervals'>
                    {chunk(intervals, INTERVALS_PER_ROW).map(row => (
                        <div className='sc-chart-type-dialog__interval-row' key={`row-${row[0].interval}`}>
                            {row.map(option => (
                                <Slot
                                    key={option.interval}
                                    className='sc-chart-type-dialog__interval'
                                    reason={option.disabledReason}
                                    show={showTooltips && option.disabled}
                                >
                                    <Chip.Selectable
                                        label={option.label}
                                        selected={option.active}
                                        disabled={option.disabled || isLoading}
                                        size='md'
                                        onChipSelect={() => onSelectInterval(option)}
                                    />
                                </Slot>
                            ))}
                            {/* The last row is short; empty cells keep every column the
                                    same width across rows, as the design's grid does. */}
                            {Array.from({ length: INTERVALS_PER_ROW - row.length }).map((_, i) => (
                                <div
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`spacer-${i}`}
                                    className='sc-chart-type-dialog__interval sc-chart-type-dialog__interval--spacer'
                                    aria-hidden='true'
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
});

/**
 * The redesigned "Chart type" dialog: chart type and time interval in one surface.
 * Renders as a centred modal on desktop and a bottom sheet on mobile.
 *
 * This shell observes only `menuStore.open`, so it re-renders when the dialog opens or
 * closes and at no other time - see `ChartTypeDialogBody` for why that matters.
 */
const ChartTypeDialog = ({ onChartType, onGranularity }: TChartTypeDialogProps) => {
    const { chartMode } = useStores();
    const { menuStore } = chartMode;
    const close = React.useCallback(() => menuStore.setOpen(false), [menuStore]);

    return (
        <DialogShell open={menuStore.open} onClose={close} className='sc-chart-type-dialog'>
            <ChartTypeDialogBody onChartType={onChartType} onGranularity={onGranularity} />
        </DialogShell>
    );
};

export default observer(ChartTypeDialog);

/* eslint-disable react/react-in-jsx-scope */
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import { ChartCrosshairDisabledIcon, ChartCrosshairEnabledIcon } from './Icons';
import Tooltip from './Tooltip';

const CrosshairToggle = () => {
    const { chart, crosshair } = useStores();
    const { isMobile } = chart;

    const CrosshairIcon = crosshair.isEnabled ? ChartCrosshairEnabledIcon : ChartCrosshairDisabledIcon;

    const crosshairLabel = crosshair.isEnabled ? t.translate('Disable Crosshair') : t.translate('Enable Crosshair');

    return (
        <Tooltip
            content={crosshairLabel}
            enabled={!isMobile}
            position='top'
            className={classNames('sc-navigation-widget__item', 'sc-crosshair-toggle', {
                'sc-crosshair-toggle--active': crosshair.isEnabled,
            })}
            onClick={() => crosshair.updateEnabledState(!crosshair.isEnabled)}
        >
            <CrosshairIcon />
        </Tooltip>
    );
};

export default observer(CrosshairToggle);

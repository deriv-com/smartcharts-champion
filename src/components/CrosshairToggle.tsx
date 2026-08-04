/* eslint-disable react/react-in-jsx-scope */
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
        <Tooltip content={crosshairLabel} enabled={!isMobile} position='top' className='sc-crosshair-toggle'>
            <button
                type='button'
                className='sc-navigation-widget__item'
                aria-label={crosshairLabel}
                onClick={() => crosshair.updateEnabledState(!crosshair.isEnabled)}
            >
                <CrosshairIcon />
            </button>
        </Tooltip>
    );
};

export default observer(CrosshairToggle);

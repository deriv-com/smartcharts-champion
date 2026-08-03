/* eslint-disable react/react-in-jsx-scope */
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import CrosshairToggle from './CrosshairToggle';
import '../../sass/components/_navigation-widget.scss';

import { ChartMinusIcon, ChartPlusIcon, ScaleIcon } from './Icons';

const NavigationWidget = () => {
    const { chart, chartSize, navigationWidget, chartSetting, chartAdapter } = useStores();
    const { context, startWithDataFitMode } = chart;
    const { zoomIn, zoomOut } = chartSize;
    const { historical } = chartSetting;
    const { onMouseEnter, onMouseLeave } = navigationWidget;
    const { isDataFitModeEnabled, toggleDataFitMode } = chartAdapter;

    return context ? (
        <div
            className={classNames('sc-navigation-widget', {
                'sc-navigation-widget--indent': historical,
            })}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className='sc-navigation-widget__buttons'>
                <div
                    className={classNames('sc-navigation-widget__item', 'sc-navigation-widget__item--scale', {
                        'sc-navigation-widget__item--hidden': !startWithDataFitMode,
                        'sc-navigation-widget__item--disabled': isDataFitModeEnabled,
                    })}
                    onClick={toggleDataFitMode}
                >
                    <ScaleIcon />
                </div>
                <div className='sc-navigation-widget__item' onClick={zoomOut}>
                    <ChartMinusIcon />
                </div>
                <CrosshairToggle />
                <div className='sc-navigation-widget__item' onClick={zoomIn}>
                    <ChartPlusIcon />
                </div>
            </div>
        </div>
    ) : null;
};

export default observer(NavigationWidget);

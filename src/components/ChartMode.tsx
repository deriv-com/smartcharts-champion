import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import { TGranularity } from 'src/types';
import '../../sass/components/_chart-mode.scss';
import ChartTypes from './ChartTypes';
import { ChartAreaIcon } from './Icons';
import Menu from './Menu';
import Timeperiod from './Timeperiod';
import InfoFootnote from './InfoFootnote';

type TChartModeProps = {
    portalNodeId?: string;
    onChartType: (chartType?: string) => void;
    onGranularity: (granularity?: TGranularity) => void;
};

const ChartMode = ({ onChartType, onGranularity, portalNodeId = '' }: TChartModeProps) => {
    const { chart, chartMode, timeperiod, state } = useStores();
    const { menuStore } = chartMode;
    const { allowTickChartTypeOnly } = state;
    const { isMobile } = chart;
    const { display: displayInterval } = timeperiod;
    const menuOpen = chartMode.menuStore.open;

    return (
        <Menu
            className='ciq-display sc-chart-mode'
            title={t.translate('Chart types')}
            tooltip={t.translate('Chart types')}
            modalMode
            isFullscreen
            portalNodeId={portalNodeId}
            store={menuStore}
        >
            <Menu.Title>
                <div className={classNames('sc-chart-mode__menu', { 'sc-chart-mode__menu--active': menuOpen })}>
                    <ChartAreaIcon />
                    {displayInterval && <span className='sc-chart-mode__menu__interval'>{displayInterval}</span>}
                </div>
            </Menu.Title>
            <Menu.Body>
                <div className='sc-chart-mode__section'>
                    <div className='sc-chart-mode__section__item'>
                        <ChartTypes newDesign onChange={onChartType} />
                    </div>
                    <div className='sc-chart-mode__section__item'>
                        <Timeperiod newDesign portalNodeId={portalNodeId} onChange={onGranularity} />
                    </div>
                </div>
                {allowTickChartTypeOnly && (
                    <InfoFootnote
                        isMobile={isMobile}
                        text={t.translate('Only selected charts and time intervals are available for this trade type.')}
                    />
                )}
            </Menu.Body>
        </Menu>
    );
};

export default observer(ChartMode);

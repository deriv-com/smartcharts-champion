import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { useStores } from 'src/store';
import DrawToolsStore from 'src/store/DrawToolsStore';
import { ArrayElement, TIcon, TMainStore } from 'src/types';
import '../../sass/components/_draw_tools.scss';
import { ActiveIcon, DeleteIcon, DrawingToolsIcon, DrawToolIcon, EmptyStateIcon } from './Icons';
import Menu from './Menu';
import NotificationBadge from './NotificationBadge';
import Scroll from './Scroll';
import { capitalize } from './ui/utils';

type TActivePanelViewProps = {
    enabled: boolean;
    children?: React.ReactNode;
};

type TActiveDrawToolsListProps = {
    activeDrawToolsGroup: TMainStore['drawTools']['activeToolsGroup'];
    onDelete: TMainStore['drawTools']['onDeleted'];
};

type InfoProps = {
    Icon?: TIcon;
    text?: string;
    num?: string | number;
    bars?: number | null;
};

type DrawToolsProps = {
    portalNodeId?: string;
};

type TActiveDrawToolsListGroupProps = {
    group: ArrayElement<TMainStore['drawTools']['activeToolsGroup']>;
    onDelete: TMainStore['drawTools']['onDeleted'];
};

type TActiveDrawToolsListItemProps = {
    item: ArrayElement<ArrayElement<TMainStore['drawTools']['activeToolsGroup']>['items']>;
    onDelete: TMainStore['drawTools']['onDeleted'];
};

type TDrawToolsListProps = {
    items: ReturnType<DrawToolsStore['getDrawToolsItems']>;
    onClick: DrawToolsStore['startAddingNewTool'];
};

const ActivePanelView = ({ enabled, children }: TActivePanelViewProps) =>
    enabled ? (
        <div className='sc-dtools--empty'>
            <EmptyStateIcon />
            <p>{t.translate('You have no active drawings yet.')}</p>
        </div>
    ) : (
        <>{children}</>
    );

const Info = ({ Icon, text, num, bars }: InfoProps) => (
    <div className='info'>
        {Icon ? <Icon className='icon' /> : ''}
        <div className='text'>
            <span>{t.translate(text, { num: num || ' ' })}</span>
            {bars ? <small>({bars} bars)</small> : ''}
        </div>
    </div>
);

const DrawToolsList = ({ items, onClick }: TDrawToolsListProps) => (
    <div className='sc-dtools__list'>
        {items.map(Item => (
            <div
                key={Item.id}
                className={classNames('sc-dtools__list__item', `sc-dtools__${Item.id}`)}
                onClick={() => onClick(Item.id)}
            >
                <Info Icon={Item.icon} text={Item.text} />
            </div>
        ))}
    </div>
);

const ActiveDrawToolsListItem = ({ item, onDelete }: TActiveDrawToolsListItemProps) => {
    return (
        <div className='sc-dtools__list__item'>
            <Info Icon={item.icon} text={item.text} bars={item.bars} num={item.num} />
            <div className='actions'>
                <DeleteIcon onClick={() => onDelete(item.index)} />
            </div>
        </div>
    );
};

const ActiveDrawToolsListGroup = ({ group, onDelete }: TActiveDrawToolsListGroupProps) => (
    <div className='sc-dtools__category'>
        <div className='sc-dtools__category__head'>{t.translate(capitalize(group.id))}</div>
        <div className='sc-dtools__category__body'>
            <div className='sc-dtools__list'>
                {group.items.map(item => (
                    <ActiveDrawToolsListItem key={item.index} item={{ ...item }} onDelete={onDelete} />
                ))}
            </div>
        </div>
    </div>
);

const ActiveDrawToolsList = ({ activeDrawToolsGroup, onDelete }: TActiveDrawToolsListProps) => {
    const sortedActiveDrawToolsGroup = activeDrawToolsGroup.sort((a, b) => {
        if (a.items.length <= 1 && b.items.length <= 1) return 0;
        if (a.items.length <= 1) return -1;
        if (b.items.length <= 1) return 1;
        return 0;
    });

    return (
        <Scroll autoHide height={320}>
            {sortedActiveDrawToolsGroup.map(group =>
                group.items.length > 1 ? (
                    <ActiveDrawToolsListGroup group={group} key={group.id} onDelete={onDelete} />
                ) : (
                    group.items.map(item => (
                        <ActiveDrawToolsListItem key={item.index} item={item} onDelete={onDelete} />
                    ))
                )
            )}
        </Scroll>
    );
};

const DrawTools = ({ portalNodeId }: DrawToolsProps) => {
    const { drawTools, chart } = useStores();
    const { isMobile } = chart;
    const {
        clearAll,
        startAddingNewTool,
        getDrawToolsItems,
        activeToolsNo: activeDrawToolsItemsNo,
        activeToolsGroup: activeDrawToolsGroup,
        onDeleted: onDelete,
        updatePortalNode,
        menuStore,
    } = drawTools;

    const drawToolsItems = getDrawToolsItems();

    const menuOpen = menuStore.open;

    updatePortalNode(portalNodeId);
    return (
        <Menu
            store={menuStore}
            className='sc-dtools'
            title={t.translate('Drawing tools')}
            tooltip={t.translate('Drawing tools')}
            modalMode
            enableTabular
            portalNodeId={portalNodeId}
        >
            <Menu.Title>
                <div className={classNames('sc-dtools__menu', { 'sc-dtools__menu--active': menuOpen })}>
                    <DrawingToolsIcon />
                    <NotificationBadge notificationCount={activeDrawToolsItemsNo} />
                </div>
            </Menu.Title>

            <Menu.Body>
                <Tabs
                    className={classNames({
                        'tabs--vertical': !isMobile,
                        'tabs--horizontal': isMobile,
                    })}
                >
                    {' '}
                    <TabList>
                        <Tab>
                            <ActiveIcon />
                            {t.translate('Active')}
                            <NotificationBadge notificationCount={activeDrawToolsItemsNo} />
                        </Tab>
                        <Tab>
                            <DrawToolIcon />
                            {t.translate('All drawings')}
                        </Tab>
                    </TabList>
                    <TabPanel>
                        <div className='sc-dtools__panel'>
                            <ActivePanelView enabled={!activeDrawToolsItemsNo}>
                                <div className='sc-dtools__panel__head'>
                                    <button
                                        type='button'
                                        className='sc-btn sc-btn--sm sc-btn--outline-secondary'
                                        onClick={clearAll}
                                    >
                                        <span>{t.translate('Clear all')}</span>
                                    </button>
                                </div>
                                <div className='sc-dtools__panel__content sc-dtools__panel__content--active'>
                                    <ActiveDrawToolsList
                                        activeDrawToolsGroup={activeDrawToolsGroup}
                                        onDelete={onDelete}
                                    />
                                </div>
                            </ActivePanelView>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className='sc-dtools__panel'>
                            <div className='sc-dtools__panel__content'>
                                <DrawToolsList items={drawToolsItems} onClick={startAddingNewTool} />
                            </div>
                        </div>
                    </TabPanel>
                </Tabs>
            </Menu.Body>
        </Menu>
    );
};

export default observer(DrawTools);

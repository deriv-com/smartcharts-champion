import {
    ActiveSymbols,
    TicksStreamResponse,
    TradingTimesResponse,
    AuditDetailsForExpiredContract,
    ProposalOpenContract,
    TGetQuotesRequest,
    OHLCStreamResponse,
    TGranularity,
} from 'src/types/api-types';

import { TActiveDrawingToolItem } from 'src/store/DrawToolsStore';
import { HtmlHTMLAttributes } from 'react';
import { BinaryAPI } from 'src/binaryapi';
import { ChartTypes } from 'src/Constant';
import ChartState from 'src/store/ChartState';
import { TNotification } from 'src/store/Notifier';

declare global {
    interface Window {
        flutterChart: TFlutterChart;
        flutterChartElement: HTMLElement;
        /** Current chart theme ('light' | 'dark'), read by the Flutter engine at bootstrap so its first frame matches the host theme */
        flutterChartTheme?: string;
        _flutter: {
            loader: {
                /** New Flutter 3.x API — handles WASM + JS build selection */
                load: (config: {
                    onEntrypointLoaded?: (engineInitializer: TEngineInitializer) => void;
                    config?: Partial<TFlutterChartConfiguration>;
                    serviceWorkerSettings?: { serviceWorkerVersion: string };
                }) => Promise<void>;
                /** Old Flutter 2.x API — kept for dart2js canvaskit fallback path */
                didCreateEngineInitializer?: (engineInitializer: TEngineInitializer) => void;
            };
            buildConfig?: {
                engineRevision?: string;
                builds: Array<{
                    compileTarget: 'dart2wasm' | 'dart2js';
                    renderer: 'skwasm' | 'canvaskit' | 'html';
                    mainWasmPath?: string;
                    jsSupportRuntimePath?: string;
                    mainJsPath?: string;
                }>;
            };
            appRunner?: {
                runApp: () => void;
            };
            initState: {
                isInitialRunCompleted: boolean;
                isEngineInitialized: boolean;
                isMounted: boolean;
            };
        };
        jsInterop: JSInterop;
    }
}

export type TAppRunner = {
    runApp: () => void;
};

export type TFlutterChartConfiguration = {
    hostElement?: HTMLElement;
    renderer?: 'html' | 'canvaskit' | 'skwasm';
    assetBase?: string;
    /** Base URL for loading main.dart.wasm, main.dart.mjs, main.dart.js */
    entryPointBaseUrl?: string;
    /** Base URL for canvaskit assets; defaults to "canvaskit" relative to page root */
    canvasKitBaseUrl?: string;
};

export type TEngineInitializer = {
    initializeEngine: ({ hostElement }: TFlutterChartConfiguration) => Promise<TAppRunner>;
};

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
    ? ElementType
    : never;

export type TObject = {
    [key: string]: unknown;
};

export type TCustomEvent = React.MouseEvent<HTMLElement> & {
    isHandledByDialog: boolean;
    nativeEvent: {
        isHandledByDialog: boolean;
        is_item_removed: boolean;
    };
};

export type TBinaryAPIRequest = {
    passthrough?: {
        [k: string]: unknown;
    };
    req_id?: number;
    [key: string]: unknown;
};

export type TBinaryAPIResponse = {
    echo_req?: {
        [k: string]: unknown;
    };
    req_id?: number;
    msg_type: any;
    active_symbols?: ActiveSymbols;
    trading_times?: TradingTimesResponse['trading_times'];
    time?: number;
    [key: string]: unknown;
};

export type TRequestAPI = (request: TBinaryAPIRequest) => Promise<TBinaryAPIResponse>;
export type TResponseAPICallback = (response: TQuote) => void;
export type TUnsubscribeQuotes = (request?: TGetQuotesRequest, callback?: TResponseAPICallback) => void;
export type TGetQuotesResult = {
    candles?: Array<{
        open: number;
        high: number;
        low: number;
        close: number;
        epoch: number;
    }>;
    history?: {
        prices: number[];
        times: number[];
    };
};

export type TGetQuotes = (params: {
    symbol: string;
    granularity: number;
    count: number;
    start?: number;
    end?: number;
    style?: string;
}) => Promise<TGetQuotesResult>;
export type TSubscribeQuotes = (
    params: { symbol: string; granularity: TGranularity },
    callback: (quote: TQuote) => void
) => () => void;
export type TNetworkConfig = {
    class: string;
    tooltip: string;
};

export type Listener = (...args: any[]) => void;

export type TIconProps = {
    className?: string;
    ['tooltip-title']?: React.ReactElement | string;
} & HtmlHTMLAttributes<HTMLSpanElement>;

export type TBar = {
    height: number;
    cName: string;
};

export type ChartType = ArrayElement<typeof ChartTypes> & { active?: boolean; disabled?: boolean };

export type TLanguage = {
    key: string;
    name: string;
    icon: JSX.Element;
};

export type TSettings = {
    countdown?: boolean;
    historical?: boolean;
    lang?: string;
    language?: string;
    minimumLeftBars?: number;
    position?: string;
    enabledNavigationWidget?: boolean;
    isAutoScale?: boolean;
    isHighestLowestMarkerEnabled?: boolean;
    isSmoothChartEnabled?: boolean;
    theme?: string;
    activeLanguages?: Array<string | TLanguage> | null;
    whitespace?: number;
};

export type TStateChangeListener = (
    state: string,
    option?: {
        indicator_type_name?: string;
        indicators_category_name?: string;
        isClosed?: boolean;
        is_favorite?: boolean;
        is_info_open?: boolean;
        is_open?: boolean;
        chart_type_name?: string;
        search_string?: string;
        symbol?: string;
        symbol_category?: string;
        time_interval_name?: string;
    }
) => void;

export type TRatio = {
    height: number;
    percent: number;
};

export type TGetIndicatorHeightRatio = (chart_height: number, indicator_count: number) => TRatio;

export type TInitialChartData = {
    masterData?: TQuote[];
    tradingTimes?: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
    activeSymbols?: ActiveSymbols;
};

export type TBarrierUpdateProps = {
    shade: string;
    shadeColor: string | undefined;
    foregroundColor: string | null;
    color: string;
    backgroundColor?: string;
    onChange: (param: TBarrierChangeParam) => void;
    relative: boolean;
    draggable: boolean;
    lineStyle: string;
    hidePriceLines: boolean;
    high?: number | string;
    low?: number | string;
    hideBarrierLine?: boolean;
    hideOffscreenBarrier?: boolean;
    hideOffscreenLine?: boolean;
    title?: string;
    showOffscreenArrows?: boolean;
    isSingleBarrier?: boolean;
    opacityOnOverlap?: number;
    useInlineLabel?: boolean;
    key: string;
};

export type TChartProps = {
    unsubscribeQuotes: BinaryAPI['unsubscribeQuotes'];
    getQuotes?: TGetQuotes;
    subscribeQuotes?: TSubscribeQuotes;
    id?: string;
    getMarketsOrder?: (active_symbols: ActiveSymbols) => string[];
    getIndicatorHeightRatio?: TGetIndicatorHeightRatio;
    symbol?: string;
    feedCall?: { activeSymbols?: boolean; tradingTimes?: boolean };
    granularity?: TGranularity;
    chartType?: string;
    should_zoom_out_on_yaxis?: boolean;
    startEpoch?: number;
    endEpoch?: number;
    chartControlsWidgets?: TChartControlsWidgets;
    topWidgets?: () => React.ReactElement;
    bottomWidgets?: () => React.ReactElement;
    toolbarWidget?: () => React.ReactElement;
    isMobile?: boolean;
    onSettingsChange?: (newSettings: Omit<TSettings, 'activeLanguages'>) => void;
    stateChangeListener?: TStateChangeListener;
    settings?: TSettings;
    barriers?: TBarrierUpdateProps[];
    enableRouting?: boolean;
    enable?: boolean;
    shouldDrawTicksFromContractInfo?: boolean;
    isConnectionOpened?: boolean;
    onMessage?: (message: TNotification) => void;
    isAnimationEnabled?: boolean;
    isVerticalScrollEnabled?: boolean;
    showLastDigitStats?: boolean;
    scrollToEpoch?: number | null;
    clearChart?: () => void;
    shouldFetchTradingTimes?: boolean;
    shouldGetQuotes?: boolean;
    allowTickChartTypeOnly?: boolean;
    allTicks?: NonNullable<AuditDetailsForExpiredContract>['all_ticks'];
    contractInfo?: ProposalOpenContract;
    maxTick?: number | null;
    zoom?: number;
    yAxisMargin?: { bottom: number; top: number };
    enableScroll?: boolean | null;
    enableZoom?: boolean | null;
    chartData?: TInitialChartData;
    networkStatus?: TNetworkConfig;
    refreshActiveSymbols?: ChartState['refreshActiveSymbols'];
    chartStatusListener?: ChartState['chartStatusListener'];
    enabledChartFooter?: boolean;
    anchorChartToLeft?: boolean;
    margin?: number;
    isStaticChart?: ChartState['isStaticChart'];
    enabledNavigationWidget?: boolean;
    onGranularityChange?: (granularity?: TGranularity) => void;
    onChartTypeChange?: (chartType?: string) => void;
    children?: React.ReactNode;
    historical?: boolean;
    contracts_array?: any[];
    isLive?: boolean;
    startWithDataFitMode?: boolean;
    leftMargin?: number;
    drawingToolFloatingMenuPosition?: TFloatingMenuPositionOffset;
    crosshairEnabled?: boolean; // Initial crosshair state. When set, overrides localStorage and doesn't persist.
};

export type TQuote = {
    Date: string;
    Open?: number;
    High?: number;
    Low?: number;
    Close: number;
    tick?: TicksStreamResponse['tick'];
    ohlc?: OHLCStreamResponse['ohlc'];
    DT?: Date;
    prevClose?: number;
    Volume?: number;
};

export interface IPendingPromise<T, E> extends Promise<T> {
    resolve: (res: T | PromiseLike<T>) => void;
    reject: (error: E | PromiseLike<E>) => void;
    isPending: boolean;
    data: any;
}

export type TChanges = {
    [key: string]: boolean;
};

export type TSettingsItemGroup = {
    key: string;
    title: string;
    fields: TSettingsParameter[];
};

export type TOpenClose = { date: string; open: Date; close: Date };
export type TTimes = { open: Date; close: Date };

export type TTradingTimesItem = {
    feed_license?: string;
    isClosedToday: boolean;
    holidays: string[];
    closes_early: TOpenClose[];
    opens_late: TOpenClose[];
    delay_amount: number;
    times?: TTimes[];
    isOpenAllDay: boolean;
    isClosedAllDay: boolean;
    isOpened?: boolean;
};

export type TBarrierChangeParam = { high?: string; low?: string };

export type TOpenMarket = {
    category?: string;
    subcategory?: string | null;
    market?: string | null;
};

export type TRefData = {
    setPosition: ({ epoch, price }: Record<string, number | null | undefined>) => void;
    div: HTMLDivElement;
    value?: Element | null;
};

export type TChartControlsWidgets = ((props: { isMobile?: boolean }) => React.ReactElement) | null;

export type TIcon = (props: TIconProps) => JSX.Element;

export type TMessage = {
    type: string;
    payload: any;
};

export type TPaginationCallbackParams = { quotes?: TQuote[]; error?: unknown; moreAvailable?: boolean };
export type TPaginationCallback = (params: TPaginationCallbackParams) => void;

export type TIndicatorConfig = {
    id: string;
    name: string;
};

export type TIndicatorsTree = {
    icon: TIcon;
    name: string;
    category: string;
    items: TIndicatorItem[];
    foundItems?: TActiveItem[];
};

export type TIndicatorItem = {
    description: string;
    icon: TIcon;
    isPrediction?: boolean;
    flutter_chart_id: string;
    name: string;
    short_name: string;
};

export type TActiveItem = TIndicatorItem & {
    id: string;
    config?: Record<string, any>;
    parameters: TSettingsParameter[];
    bars?: string;
    short_name_and_index: string;
    group_length: number;
};

export type TNewChartPayload = {
    granularity: number;
    isLive: boolean;
    startWithDataFitMode: boolean;
    symbol?: string;
    chartType?: string;
    theme: string;
    msPerPx?: number;
    pipSize?: number;
    isMobile: boolean;
    isSmoothChartEnabled?: boolean;
    yAxisMargin?: {
        top: number;
        bottom: number;
    };
};

export type TIndicatorTooltipContent = {
    name: string;
    values: string[];
};

export type TDrawingToolConfig = {
    configId: string;
};

export type TFlutterChart = {
    app: {
        getXAxisHeight: () => number;
        getYAxisWidth: () => number;
        getCurrentTickWidth: () => number;
        newChart: (payload: TNewChartPayload) => void;
        getIndicatorHoverIndex: (
            x: number,
            y: number,
            getClosestEpoch: ((epoch: number, granularity: number) => number) | undefined,
            granularity: number,
            _indicatorIndex: number | undefined
        ) => number | null;
        getTooltipContent: (epoch: number, pipSize: number) => TIndicatorTooltipContent[];
        getXFromEpoch: (epoch: number) => number;
        getYFromQuote: (quote: number) => number;
        getEpochFromX: (x: number) => number;
        getQuoteFromY: (y: number) => number;
        scale: (scale: number) => number;
        scroll: (pxShift: number) => void;
        toggleDataFitMode: (isDataFitEnabled: boolean) => void;
        toggleXScrollBlock: (isXScrollBlocked: boolean) => void;
        scrollToLastTick: () => void;
        addOrUpdateIndicator: (config: string, index?: number) => void;
    };
    config: {
        updateTheme: (theme: string) => void;
        updateChartStyle: (chartStyle: string) => void;
        updateLiveStatus: (isLive: boolean) => void;
        updateContracts: (markers: any[]) => void;
        updateCrosshairVisibility: (visibility: boolean) => void;
        updateLeftMargin: (leftMargin?: number) => void;
        updateRightPadding: (rightPadding?: number) => void;
        setSymbolClosed: (isClosed: boolean) => void;
        toggleTimeIntervalVisibility: (showInterval: boolean) => void;
        setRemainingTime: (time: string) => void;
    };
    feed: {
        onNewTick: (quote: TQuote) => void;
        onNewCandle: (quote: TQuote) => void;
        onTickHistory: (quotes: TQuote[], append: boolean) => void;
    };
    indicators: {
        removeIndicator: (index: number) => void;
        clearIndicators: () => void;
    };
    drawingTool: {
        updateFloatingMenuPosition: (x: number, y: number) => void;
        startAddingNewTool: (config: string, index?: number) => void;
        cancelAddingNewTool: () => void;
        removeDrawingTool: (index: number) => void;
        clearDrawingTool: () => void;
        // eslint-disable-next-line @typescript-eslint/ban-types
        getDrawingToolsRepoItems: () => string[];
        clearDrawingToolSelect: () => void;
    };
};

export type JSInterop = {
    onChartLoad: () => void;
    onMainSeriesPaint: (currentTickPercent: number, lerpedQuote?: number | null) => void;
    onVisibleAreaChanged: (leftEpoch: number, rightEpoch: number) => void;
    onQuoteAreaChanged: (topQuote: number, bottomQuote: number) => void;
    loadHistory: (request: TLoadHistoryParams) => void;
    indicators: {
        onRemove: (index: number) => void;
        onEdit: (index: number) => void;
        onSwap: (index1: number, index2: number) => void;
    };
    drawingTool: {
        onUpdate: (index: number, config: TDrawingToolConfig) => void;
        onLoad: (drawings: []) => void;
        onToolAdded: (toolJson: string) => void;
        onRemove: (deletedToolName: string) => void;
        onStateChanged: (currentStep: number, totalSteps: number) => void;
    };
};

export type TLoadHistoryParams = {
    count: number;
    end: number;
};

export type TDragEvents = {
    onDragStart?: (ev: MouseEvent) => void;
    onDrag?: (ev: MouseEvent) => void;
    onDragReleased?: (ev: MouseEvent) => void;
};

export type TLayout = {
    chartType?: string;
    timeUnit?: string | number;
    granularity?: TGranularity;
    studyItems?: TActiveItem[];
    drawTools?: TActiveDrawingToolItem[];
    msPerPx?: number;
};

export type TAllTicks = NonNullable<AuditDetailsForExpiredContract>['all_ticks'];

export type TSettingsParameterType =
    | 'colorpicker'
    | 'number'
    | 'select'
    | 'numbercolorpicker'
    | 'switch'
    | 'pattern'
    | 'numericinput'
    | 'font';
export type TIndicatorCategory = 'inputs' | 'outputs' | 'parameters';

export interface BaseIndicatorParameter {
    path?: string;
    paths?: {
        [x: string]: string;
    };
    type: TSettingsParameterType;
    title: string;
    subtitle?: string;
    category: TIndicatorCategory;
    group_key?: string;
}

export interface IndicatorParameter<T> extends BaseIndicatorParameter {
    value?: T;
    defaultValue: T;
}

export interface TColorPickerParameter extends IndicatorParameter<string> {
    type: 'colorpicker';
}

export interface TNumberParameter extends IndicatorParameter<number> {
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
}

export interface TSelectParameter extends IndicatorParameter<string> {
    type: 'select';
    options: Record<string, string>;
}

export type TNumberPickerValue = {
    color: string;
    value: number;
};

export interface TNumberColorPickerParameter extends IndicatorParameter<TNumberPickerValue> {
    type: 'numbercolorpicker';
}

export interface TSwitchParameter extends IndicatorParameter<boolean> {
    type: 'switch';
}

export interface TPatternParameter extends IndicatorParameter<string> {
    type: 'pattern';
}

export interface TFontParameter extends IndicatorParameter<Record<string, string | undefined>> {
    type: 'font';
}

export interface TNumericInputParameter extends IndicatorParameter<number> {
    type: 'numericinput';
    min?: number;
    max?: number;
    step?: number;
}

export type TSettingsParameter =
    | TColorPickerParameter
    | TNumberParameter
    | TSelectParameter
    | TNumberColorPickerParameter
    | TSwitchParameter
    | TPatternParameter
    | TFontParameter
    | TNumericInputParameter;

export type TDefaultIndicatorConfig = {
    config?: Record<string, any>;
    parameters: TSettingsParameter[];
};

export type TDefaultIndicatorConfigFn = () => TDefaultIndicatorConfig;

export type TDefaultIndicatorConfigMap = Record<string, TDefaultIndicatorConfigFn>;

export type TFloatingMenuPositionOffset = {
    x: number;
    y: number;
};

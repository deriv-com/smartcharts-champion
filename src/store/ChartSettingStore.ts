import { observable, action, when, reaction, makeObservable } from 'mobx';
import { TLanguage, TSettings } from 'src/types';
import MainStore from '.';
import Context from '../components/ui/Context';
import { Languages, STATE, Intervals } from '../Constant';
import { LogActions, LogCategories, logEvent } from '../utils/ga';
import { getTimeIntervalName } from '../utils';
import MenuStore from './MenuStore';

export default class ChartSettingStore {
    mainStore: MainStore;
    menuStore: MenuStore;

    language: TLanguage | string = '';
    position = 'bottom';
    theme = 'light';
    countdown = false;
    historical = false;
    isAutoScale = true;
    isHighestLowestMarkerEnabled = true;
    isSmoothChartEnabled = true;
    minimumLeftBars?: number;
    whitespace?: number;

    constructor(mainStore: MainStore) {
        makeObservable(this, {
            language: observable,
            position: observable,
            theme: observable,
            countdown: observable,
            historical: observable,
            isAutoScale: observable,
            isHighestLowestMarkerEnabled: observable,
            isSmoothChartEnabled: observable,
            minimumLeftBars: observable,
            updateActiveLanguage: action.bound,
            setLanguage: action.bound,
            setInitialTheme: action.bound,
            setTheme: action.bound,
            setPosition: action.bound,
            showCountdown: action.bound,
            setHistorical: action.bound,
            setAutoScale: action.bound,
            setWhiteSpace: action.bound,
            toggleHighestLowestMarker: action.bound,
            toggleSmoothChart: action.bound,
            whitespace: observable,
        });

        this.defaultLanguage = this.languages[0];
        this.mainStore = mainStore;
        this.menuStore = new MenuStore(mainStore, { route: 'setting' });
        
        // Load smooth chart setting from localStorage
        const savedSmoothChart = localStorage.getItem('is_smooth_chart_enabled');
        if (savedSmoothChart !== null) {
            this.isSmoothChartEnabled = savedSmoothChart === 'true';
        }
        // below reaction is updating the symbols and those elements that are not updating automatically on language change.
        reaction(
            () => (this?.language as TLanguage)?.key,
            () => {
                // activeSymbols was removed from chart, directly call changeSymbol with isLanguageChanged=true
                mainStore?.chart?.changeSymbol?.(mainStore.state.symbol, mainStore.state.granularity, true);
            }
        );
        when(
            () => !!this.context,
            () => {
                this.setSettings(mainStore.state.settings);
            }
        );
    }
    get context(): Context | null {
        return this.mainStore.chart.context;
    }

    languages: (TLanguage | string)[] = [];
    defaultLanguage = {} as TLanguage | string;
    onSettingsChange?: (newSettings: Omit<TSettings, 'activeLanguages'>) => void = undefined;

    setSettings(settings?: TSettings) {
        if (settings === undefined) {
            return;
        }
        const {
            countdown,
            historical,
            language,
            minimumLeftBars,
            position,
            isAutoScale,
            isHighestLowestMarkerEnabled,
            isSmoothChartEnabled,
            theme,
            activeLanguages,
            whitespace,
        } = settings;
        if (
            !(
                (!activeLanguages && Languages.every(x => this.languages.find(y => (y as TLanguage).key === x.key))) ||
                (activeLanguages &&
                    this.languages.length === activeLanguages.length &&
                    this.languages.every(x => activeLanguages.indexOf((x as TLanguage).key.toUpperCase()) !== -1))
            )
        ) {
            this.updateActiveLanguage(activeLanguages as Array<string>);
        }
        if (theme !== undefined) {
            this.setTheme(theme);
        }
        if (position !== undefined) {
            this.setPosition(position);
        }
        if (countdown !== undefined) {
            this.showCountdown(countdown);
        }
        if (language !== undefined) {
            this.setLanguage(language);
        }
        this.setMinimumLeftBars(minimumLeftBars);
        if (historical !== undefined) {
            this.setHistorical(historical);
        }
        if (isAutoScale !== undefined) {
            this.setAutoScale(isAutoScale);
        }
        if (isHighestLowestMarkerEnabled !== undefined) {
            this.toggleHighestLowestMarker(isHighestLowestMarkerEnabled);
        }
        if (isSmoothChartEnabled !== undefined) {
            this.toggleSmoothChart(isSmoothChartEnabled);
        }
        this.setWhiteSpace(whitespace);
    }
    saveSetting() {
        if (this.onSettingsChange && this.language) {
            this.onSettingsChange({
                countdown: this.countdown,
                historical: this.historical,
                language: (this.language as TLanguage)?.key,
                position: this.position,
                isAutoScale: this.isAutoScale,
                isHighestLowestMarkerEnabled: this.isHighestLowestMarkerEnabled,
                isSmoothChartEnabled: this.isSmoothChartEnabled,
                minimumLeftBars: this.minimumLeftBars,
                theme: this.theme,
                whitespace: this.whitespace,
            });
        }
    }
    updateActiveLanguage(activeLanguages: Array<string>) {
        if (activeLanguages) {
            this.languages = activeLanguages
                .map(lngKey => Languages.find(lng => lng.key.toUpperCase() === lngKey) || '')
                .filter(x => x);
        } else this.languages = Languages;
        // set default language as the first item of active languages or Eng
        this.defaultLanguage = this.languages[0] as TLanguage;
        if (
            (this.language && !this.languages.find(x => (x as TLanguage).key === (this.language as TLanguage)?.key)) ||
            !this.language
        ) {
            this.setLanguage((this.languages[0] as TLanguage).key);
        }
    }
    setLanguage(lng: string) {
        if (!this.languages.length) {
            return;
        }
        const newLang = lng.toLowerCase();
        if (this.language && newLang === (this.language as TLanguage).key) {
            return;
        }
        this.language = this.languages.find(item => (item as TLanguage).key === newLang) || this.defaultLanguage;
        const updatedLanguage = (this.language as TLanguage).key;
        t.setLanguage(updatedLanguage, () => {
            this?.mainStore?.loader?.hide?.();
        });
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, `Change language to ${updatedLanguage}`);
        if (updatedLanguage !== localStorage.getItem('current_chart_lang')) {
            localStorage.setItem('current_chart_lang', updatedLanguage);
        }
        if (updatedLanguage !== this.mainStore.chart.currentLanguage) {
            this.mainStore.chart.currentLanguage = updatedLanguage;
            
            // Save the layout to ensure drawing tools are preserved
            this.mainStore.state.saveLayout();
            
            // Force reload of drawing tools from Flutter side
            // This triggers the _loadSavedDrawingTools method in drawing_tool.dart
            setTimeout(() => {
                // First get the current symbol
                const symbol = this.mainStore.chart.currentActiveSymbol?.symbol;
                if (symbol) {
                    // Create a new chart payload to trigger the drawing tool reload
                    window.flutterChart?.app.newChart({
                        symbol,
                        granularity: this.mainStore.chartAdapter.getGranularityInMs(),
                        chartType: this.mainStore.state.chartType,
                        isLive: this.mainStore.chart.isLive || false,
                        startWithDataFitMode: this.mainStore.chartAdapter.isDataFitModeEnabled,
                        theme: this.theme,
                        msPerPx: this.mainStore.chartAdapter.msPerPx,
                        pipSize: this.mainStore.chart.pip,
                        isMobile: this.mainStore.chart.isMobile || false,
                        isSmoothChartEnabled: this.isSmoothChartEnabled,
                        yAxisMargin: this.mainStore.state.yAxisMargin,
                    });
                }
            }, 100);
        }
        this.saveSetting();
    }
    /**
     * Seeds the theme at store construction, before the first render commits,
     * so the chart never paints its default light theme for a frame when the
     * host mounts it in dark mode. Unlike setTheme, this must not trigger the
     * settings-save/GA side effects — the value comes from the host, not the user.
     */
    setInitialTheme(theme?: string) {
        // On a warm remount (e.g. mobile Trade -> Menu -> Trade) the JS store is
        // rebuilt with the default 'light' theme, but the Flutter engine and the
        // window.flutterChartTheme global survive. Resolve the real target from
        // the host prop first, then the last-known global, then the store default,
        // so we never regress a dark chart to light just because the fresh store
        // hasn't been told the current theme yet.
        const resolvedTheme = theme || window.flutterChartTheme || this.theme;
        this.theme = resolvedTheme;
        // A cold engine reads this global at bootstrap so its very first frame
        // is painted with the correct theme instead of the Dart light default.
        window.flutterChartTheme = resolvedTheme;
        // Always push to the (possibly warm) engine, without an equality guard:
        // it retains the theme from its previous mount, and setTheme() will later
        // early-return on an unchanged value. initContext runs during render,
        // before onMount reattaches the canvas, so the engine repaints the correct
        // theme before it becomes visible again — preventing the wrong-theme flash.
        this.mainStore.chartAdapter.updateTheme(resolvedTheme);
    }
    setTheme(theme: string) {
        if (this.theme === theme) {
            return;
        }
        this.theme = theme;
        window.flutterChartTheme = theme;

        this.mainStore.drawTools.updateTheme();

        this.mainStore.chartAdapter.updateTheme(theme);
        if (this.context) {
            this.mainStore.state.setChartTheme(theme);
        }
        this.mainStore.studies.updateTheme();
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, `Change theme to ${theme}`);
        this.saveSetting();
    }
    setPosition(value: string) {
        if (this.position === value) {
            return;
        }
        this.position = value;
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, 'Change Position');
        this.saveSetting();
        /**
         * Chart should fix its height & width after the position changed,
         * for that purpose we stay some 10 ms so that position varaible update
         * on chart context then ask chart to update itself hight & width
         */
        setTimeout(() => {
            this.mainStore.chart.resizeScreen();
        }, 10);
        this.menuStore.setOpen(false);
    }
    showCountdown(value: boolean) {
        if (this.countdown === value) {
            return;
        }
        this.mainStore.chartAdapter.setShowInterval(value);
        this.countdown = value;
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, `${value ? 'Show' : 'Hide'} Countdown`);
        this.saveSetting();
    }

    setHistorical(value: boolean) {
        if (this.historical === value) {
            return;
        }
        this.historical = value;
        this.isHighestLowestMarkerEnabled = !value;
        this.saveSetting();
        /**
         * Chart should fix its height & width after the position changed,
         * for that purpose we stay some 10 ms so that position varaible update
         * on chart context then ask chart to update itself hight & width
         */
        setTimeout(() => {
            this.mainStore.chart.resizeScreen();
        }, 10);
    }
    setAutoScale(value: boolean) {
        if (this.isAutoScale === value) {
            return;
        }
        this.isAutoScale = value;
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, ` Change AutoScale to ${value}`);
        this.saveSetting();
    }
    setMinimumLeftBars(value?: number) {
        if (this.minimumLeftBars === value) {
            return;
        }
        this.minimumLeftBars = value;
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, ` Change MinimumLeftBars to ${value}`);
        this.saveSetting();
    }
    setWhiteSpace(value?: number) {
        if (this.whitespace === value) {
            return;
        }
        this.whitespace = value;
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, ` Change Whitespace to ${value}`);
        this.saveSetting();
    }
    toggleHighestLowestMarker(value: boolean) {
        if (this.isHighestLowestMarkerEnabled === value) {
            return;
        }
        this.isHighestLowestMarkerEnabled = value;
        logEvent(
            LogCategories.ChartControl,
            LogActions.ChartSetting,
            ` ${value ? 'Show' : 'Hide'} HighestLowestMarker.`
        );
        this.saveSetting();
    }
    toggleSmoothChart(value: boolean) {
        if (this.isSmoothChartEnabled === value) {
            return;
        }
        this.isSmoothChartEnabled = value;
        
        // Save to localStorage
        localStorage.setItem('is_smooth_chart_enabled', value.toString());
        
        logEvent(LogCategories.ChartControl, LogActions.ChartSetting, ` ${value ? 'Enable' : 'Disable'} Smooth Chart.`);
        const chart_type = this.mainStore.chartType.type;
        const state = this.mainStore.state;
        this.mainStore.state.stateChange(STATE.CHART_SWITCH_TOGGLE, {
            enable_smooth_chart: value ? 'enable' : 'disable',
            chart_type_name: chart_type.id === 'colored_bar' ? chart_type.text : chart_type.text.toLowerCase(),
            time_interval_name: getTimeIntervalName(state.granularity, Intervals),
        });
        this.saveSetting();
        // Refresh the chart to apply the new smooth chart setting
        this.mainStore.chart.refreshChart();
    }
}

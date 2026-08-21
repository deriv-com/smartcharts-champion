import { action, makeObservable, observable, runInAction } from 'mobx';

const lang_map: {
    [key: string]: Record<string, string>;
} = {};

export class Translation {
    lang: string;
    constructor(lang = 'en') {
        this.lang = lang;
        // `lang` must be observable: `translate()` reads it, so making it observable
        // is what subscribes every `observer` component that renders a translated
        // string to a language switch. Without it nothing re-renders on its own and
        // strings only refresh when React happens to re-render for another reason —
        // which never happens for a prop-less `observer` (mobx-react-lite wraps those
        // in React.memo, so a parent re-render can't reach them). That left e.g. the
        // CrosshairToggle tooltip showing the previous language until it was clicked.
        makeObservable(this, {
            lang: observable,
            setLanguage: action,
        });
    }

    setLanguage(lang: string, callback: () => void) {
        if (lang_map[lang] || lang === 'en') {
            this.lang = lang;
            callback?.();
        } else {
            import(/* webpackChunkName: "[request]" */ `../translation/${lang}.json`)
                .then(imported_lang => {
                    if (imported_lang) {
                        lang_map[lang] = imported_lang.default;
                        // The `action` on setLanguage does not cover this callback: it
                        // runs in a later microtask, outside that action's scope.
                        runInAction(() => {
                            this.lang = lang;
                        });
                    } else {
                        console.error('Unsupported language:', lang);
                    }
                })
                .catch(error => {
                    console.error('Failed to load language:', lang, error);
                })
                // The callback is the caller's "locale settled" signal (it drives the
                // loader). It must run on failure too, otherwise a chunk that 404s or
                // an unsupported locale strands the caller waiting forever.
                .then(() => callback?.());
        }
    }

    /**
     *
     * @param {*} args include string to be translated, its plural form,
     * and object containing key value pair for replacement in translated string.
     *
     * For eg: translate('_n Hour','_n Hours',{'_n':2})
     * Note: The first key-value pair will be used to determine the plural form.
     *
     */
    translate(...args: [string, Record<string, string>]) {
        const curr_lang = lang_map[this.lang];
        const key = args[0].trim();
        const key_with_quotation = key.replace(/\\/g, '\\\\').replace(/"/g, '\\"'); /* eslint-disable-line */
        let translated = key;
        let has_quotation = false;

        if (curr_lang && curr_lang[key]) {
            translated = curr_lang[key];
        } else if (curr_lang && curr_lang[key_with_quotation]) {
            translated = curr_lang[key_with_quotation];
            has_quotation = true;
        }

        if (args[1]) {
            Object.keys(args[1]).forEach(prop => {
                translated = translated.replace(`[${prop}]`, args[1][prop]);
            });
        }
        return has_quotation ? translated.replace(/\\\"/gi, '"') : translated; /* eslint-disable-line */
    }
}

const trans = new Translation();
export const t = trans;

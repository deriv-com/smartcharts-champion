import { TicksStreamResponse, ProposalOpenContract, TicksHistoryResponse as BaseTicksHistoryResponse } from '@deriv/api-types';
import { OHLCStreamResponse, TAllTicks, TQuote } from 'src/types';
import { getUTCDate, lerp } from '../utils';

interface HistoryTick {
    epoch: string;
    ask: string;
    bid: string;
    quote: string;
}

export interface TicksHistoryResponse extends Omit<BaseTicksHistoryResponse, 'history'> {
    history?: HistoryTick[];
    candles?: {
        epoch: string;
        open: string;
        high: string;
        low: string;
        close: string;
    }[];
}

export class TickHistoryFormatter {
    static formatHistory(response: TicksHistoryResponse): TQuote[] | undefined {
        const { history, candles } = response;
        if (history?.length) {
            return history.map(tick => ({
                Date: getUTCDate(+tick.epoch),
                Close: +tick.quote,
            }));
        }

        if (candles) {
            const quotes: TQuote[] = candles.map(c => {
                const candle = c as Required<typeof c>;
                return {
                    Date: getUTCDate(+candle.epoch),
                    Open: +candle.open,
                    High: +candle.high,
                    Low: +candle.low,
                    Close: +candle.close,
                };
            });
            return quotes;
        }
        return undefined;
    }

    static formatTick(response: TicksStreamResponse | OHLCStreamResponse): TQuote | undefined {
        if ('tick' in response) {
            const { tick } = response as Required<typeof response>;
            const t = tick as Required<typeof tick>;
            return {
                Date: getUTCDate(+t.epoch),
                Close: +t.quote,
                // Keep the origial value.
                // It'll be used to pass down to deriv.app in BottomWidgets.
                // TODO: use tick.epoch in RawMarker to speed up calculations.
                tick,
            };
        }

        if ('ohlc' in response) {
            const { ohlc } = response as OHLCStreamResponse;
            return {
                Date: getUTCDate(+ohlc.open_time),
                Open: +ohlc.open,
                High: +ohlc.high,
                Low: +ohlc.low,
                Close: +ohlc.close,
                ohlc,
            };
        }

        return undefined;
    }
    static formatAllTicks(allTicksContract: TAllTicks): TQuote[] | undefined {
        const getNearestTick = (index: number): number => {
            const nextItem = allTicksContract?.[index + 1];
            const prevItem = allTicksContract?.[index - 1];
            return prevItem?.tick && nextItem?.tick
                ? lerp(prevItem?.tick, nextItem?.tick, 0.5)
                : ((nextItem?.tick || prevItem?.tick) as number);
        };
        return allTicksContract?.map((res, index: number) => ({
            Date: getUTCDate(+(res.epoch as number)),
            Close: +(res.tick || getNearestTick(index)),
        }));
    }
    static formatPOCTick(contract_info: ProposalOpenContract) {
        const { tick_stream = [], underlying = '' } = contract_info || {};
        if (tick_stream.length && underlying) {
            return tick_stream.map(({ epoch = 0, tick, tick_display_value }) => ({
                Date: getUTCDate(epoch),
                Close: tick || 0,
                tick: {
                    epoch,
                    quote: tick || 0,
                    symbol: underlying,
                    pip_size: tick_display_value?.split('.')[1]?.length || 0,
                },
            }));
        }
        return null;
    }
}

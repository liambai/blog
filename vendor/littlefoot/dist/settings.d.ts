import { UseCaseSettings } from './use-cases';
import { HTMLAdapterSettings } from './dom/document';
export type Settings = HTMLAdapterSettings & UseCaseSettings<HTMLElement>;
export declare const DEFAULT_SETTINGS: Settings;

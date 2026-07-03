import { Settings } from './settings';
type Littlefoot = Readonly<{
    activate: (id: string, delay?: number) => void;
    dismiss: (id?: string, delay?: number) => void;
    unmount: () => void;
    getSetting: <K extends keyof Settings>(key: K) => Settings[K];
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}>;
export declare function littlefoot(userSettings?: Partial<Settings>): Littlefoot;
export default littlefoot;

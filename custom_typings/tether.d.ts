declare module "tether" {

    export = Tether;

    // global Tether constructor
    class Tether {
        constructor(options: Tether.ITetherOptions);

        public setOptions(options: Tether.ITetherOptions): void;
        public disable(): void;
        public enable(): void;
        public destroy(): void;
        public position(): void;

        on(event: string, handler: Function, ctx?: any, once?: boolean): void;
        once(event: string, handler: Function, ctx?: any): void;
        off(event: string, handler: Function): void;
        trigger(event: string, ...args: any[]): void;

        public static position(): void;
    }

    namespace Tether {
        interface ITetherOptions {
            attachment?: string;
            bodyElement?: HTMLElement;
            classes?: {[className: string]: boolean};
            classPrefix?: string;
            constraints?: ITetherConstraint[];
            element?: HTMLElement | string | any /* JQuery */;
            enabled?: boolean;
            offset?: string;
            optimizations?: any;
            target?: HTMLElement | string | any /* JQuery */;
            targetAttachment?: string;
            targetOffset?: string;
            targetModifier?: string;
        }

        interface ITetherConstraint {
            attachment?: string;
            outOfBoundsClass?: string;
            pin?: boolean | string[];
            pinnedClass?: string;
            to?: string | HTMLElement | number[];
        }
    }

}
/**
 *
 * @export
 * @interface CreateMidjourneyRequest
 */
export interface CreateMidjourneyRequest {
    /**
     * A text description of the desired image(s). The maximum length is 1000 characters.
     * @type {string}
     * @memberof CreateMidjourneyRequest
     */
    'prompt': string;
    /**
     * The number of images to generate. Must be between 1 and 10.
     * @type {number}
     * @memberof CreateMidjourneyRequest
     */
    'num_outputs'?: number | null;
    /**
     * The size of the generated images. Must be one of `256x256`, `512x512`, or `1024x1024`.
     * @type {string}
     * @memberof CreateMidjourneyRequest
     */
    'width'?: CreateMidjourneyWidthEnum;

    /**
     * The size of the generated images. Must be one of `256x256`, `512x512`, or `1024x1024`.
     * @type {string}
     * @memberof CreateMidjourneyRequest
     */
    'height'?: CreateMidjourneyHeightEnum;
}
export declare const CreateMidjourneyWidthEnum: {
    readonly _128: "128";
    readonly _256: "256";
    readonly _512: "512";
    readonly _1024: "1024";
};
export declare type CreateMidjourneyWidthEnum = typeof CreateMidjourneyWidthEnum[keyof typeof CreateMidjourneyWidthEnum];

export declare const CreateMidjourneyHeightEnum: {
    readonly _128: "128";
    readonly _256: "256";
    readonly _512: "512";
    readonly _1024: "1024";
};
export declare type CreateMidjourneyHeightEnum = typeof CreateMidjourneyHeightEnum[keyof typeof CreateMidjourneyHeightEnum];

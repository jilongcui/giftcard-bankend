import { Subscriber } from "rxjs";

export interface EngineService {
    setMode(mode: string): any;

    open(appmodelId: number, userId: string, userName: string): any;

    prompt(appmodelId: string, userId: string, intext: string): any

    promptSse(ob:Subscriber<MessageEvent>, openId: string, appmodelId: string, userId: string, nanoId: string, intext: string): any
}
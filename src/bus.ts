type event = {
  _id: string,
  token: string,
  cb: Function,
  once: boolean,
}

type destroyCb = () => void;

export interface Messenger {
  emit(token:string, info?: any):void;
}

export interface Listener {
  on(token: string, cb: Function): destroyCb;
  once(token: string, cb: Function): void;
}

export interface EventDestroyer {
  off(token: string | string[]):void;
}

export class Bus implements Messenger, Listener, EventDestroyer {
  _q: event[];

  constructor() {
    this._q = [];
  }

  emit(token:string, info?:any):void {
      for (let i = 0, len = this._q.length; i < len; i++) {
          if (this._q[i].token === token) {
              this._q[i].cb(info);

              if (this._q[i].once) {
                this._q.splice(i, 1);
                break;
              }
          }
      }
  }

  on(token:string, cb:Function): destroyCb {
    let _id = this._genId();

    this._q.push({
      _id: _id,
      token: token,
      cb: cb,
      once: false,
    })

    return () => {
      for (let i = 0, len = this._q.length; i < len; i++) {
        if (this._q[i]._id === _id) {
          this._q.splice(i, 1);
          break;
        }
      }
    }
  }

  once(token: string, cb: Function):void {
    this._q.push({
      _id: this._genId(),
      token: token,
      cb: cb,
      once: true
    });
  }

  off(token: string | string[]):void {
    if (typeof(token) === "string") {
        for (let i = 0, len = this._q.length; i < len; i++) {
          if (this._q[i].token === token) {
            this._q.splice(i, 1);
            i--;
          }
        }
    }

    if ((typeof(token) === "object") && !!token.length) {
        token.forEach((t) => {
          for (let i = 0, len = this._q.length; i < len; i++) {
            if (this._q[i].token === t) {
              this._q.splice(i, 1);
              i--;
            }
          }
        });
    }
  }

  _genId() {
    function s4() {
      return ~~((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
}

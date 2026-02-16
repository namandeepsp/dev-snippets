export interface IScript {
  name: string;
  run(): Promise<void>;
}

export interface IEnvironment {
  enableSwagger: boolean;
}

export default () => {
  return {
    enableSwagger: process.env.ENABLE_SWAGGER == 'true',
  }
}
export const environment = {};

export async function prepareEnvironment() {
  const { worker } = await import('../../mocks/browser');

  await worker.start();
}

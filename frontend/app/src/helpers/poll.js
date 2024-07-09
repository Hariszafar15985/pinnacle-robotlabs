export default async function poll(
  initialFn,
  secondaryFn,
  fnCondition,
  ms = 1000
) {
  try {
    let res = await initialFn();
    if (fnCondition(res)) {
      const taskId = res.data.task_id;
      while (fnCondition(res)) {
        await wait(ms);
        res = await secondaryFn(taskId);
      }
    }
    return res;
  } catch (e) {
    console.error("Error:", e);
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

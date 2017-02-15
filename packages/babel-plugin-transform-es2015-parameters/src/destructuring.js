import * as t from "babel-types";

export const visitor = {
  Function(path) {
    const params: Array = path.get("params");

    // If there's a rest param, no need to loop through it. Also, we need to
    // hoist one more level to get `declar` at the right spot.
    const hoistTweak = t.isRestElement(params[params.length - 1]) ? 1 : 0;
    const outputParamsLength = params.length - hoistTweak;

    for (let i = 0; i < outputParamsLength; i++) {
      const param = params[i];
      if (param.isArrayPattern() || param.isObjectPattern()) {
        const uid = path.scope.generateUidIdentifier("ref");

        const declar = t.variableDeclaration("let", [
          t.variableDeclarator(param.node, uid)
        ]);

        // Match what we do with default params and hoist to the very top
        // (priority of 3), while keeping param order.
        declar._blockHoist = (outputParamsLength - i) + 3;

        path.ensureBlock();
        path.get("body").unshiftContainer("body", declar);

        param.replaceWith(uid);
      }
    }
  }
};

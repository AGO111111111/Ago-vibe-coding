export function binding(db) {
  return {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() { return db.prepare(sql).get(...args); },
            async run() { return {meta: {changes: db.prepare(sql).run(...args).changes}}; }
          };
        }
      };
    }
  };
}

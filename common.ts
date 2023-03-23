import { Types } from "mongoose";

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Инфа по типам ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * SRC: https://stackoverflow.com/questions/49464634/difference-between-object-and-object-in-typescript
 *
 * Object — Contains stuff (like toString(), hasOwnProperty()) that is present in all JavaScript objects. Any value (primitive, non-primitive) can be assigned to Object type.
 *
 * {} — {} is an empty object. It is pretty much the same as Object in runtime but different in compile time. In compile time {} doesn't have Object's members and Object has more strict behavior (see the @golmschenk's comment).
 *
 * object — object was introduced in TypeScript 2.2. It is any non-primitive type. You can't assign to it any primitive type like bool, number, string, symbol.
 */

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// FRONT ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Признак выбранности экземпляра сущности.
 * For frontend.
 */
export type ISelected = {
  selected: boolean;
};

/**
 * Признак выбранности экземпляра сущности. 2 чекбокса выбранности.
 * For frontend.
 */
export type ISelectedTwoFlags = {
  selected1: boolean;
  selected2: boolean;
};

/**
 * Признак выбранности экземпляра сущности. 3 чекбокса выбранности.
 * For frontend.
 */
export type ISelectedThreeFlags = {
  selected1: boolean;
  selected2: boolean;
  selected3: boolean;
};

/**
 * Признак видимости экземпляра сущности.
 * For frontend.
 */
export type IVisible = {
  visible: boolean;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// mongoose Schema //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
type IPrimitiveForMongo = string | number | boolean;

type IFieldType<T> = T extends Types.ObjectId
  ? Types.ObjectIdConstructor
  : T extends Types.ObjectId[]
  ? typeof Types.ObjectId[]
  : T extends Date
  ? typeof Date
  : T extends string
  ? typeof String
  : T extends string[]
  ? typeof String[]
  : T extends number
  ? typeof Number
  : T extends number[]
  ? typeof Number[]
  : T extends boolean
  ? typeof Boolean
  : T extends boolean
  ? typeof Boolean[]
  : never;

type IField<T> = {
  type: IFieldType<T>;
  required: true;
  unique?: boolean;
  dropDups?: boolean;
  default?: T extends Date ? () => number | undefined : T;
  validate?: [(value: T) => boolean, string | ((value: T) => string)];
} & (T extends Types.ObjectId ? { ref: string } : {}) &
  (T extends string ? { trim?: boolean } : {});

/**
 * Сформировать на основе модели бэкенда описание для Schema MongoDB.
 */
export type IModelDefinition<T> = {
  [P in keyof Required<Omit<T, "_id">>]: Required<T>[P] extends  // Required — чтобы в definition для Schema обязательно фигурировали объекты для необязательных пропов (у них гарантированно должно отсутствовать required: true).
    | Types.ObjectId
    | Date
    | IPrimitiveForMongo
    | IPrimitiveForMongo[]
    ? Pick<T, P> extends Required<Pick<T, P>> // Если дата или ObjectId или примитив.
      ? IField<Required<T>[P]> // Если наткнулись на обязательный проп.
      : Omit<IField<Required<T>[P]>, "required"> // Если наткнулись на необязательный проп (то есть a?: string или a: string | undefined или a?: string | undefined), то исключаем required.
    : Required<T>[P] extends Array<infer U> // Если является массивом.
    ? U extends Types.ObjectId | Date // Если является массивом дат или ObjectId.
      ? Pick<T, P> extends Required<Pick<T, P>>
        ? [IField<U>]
        : [Omit<IField<U>, "required">]
      : U extends object // Если является массивом объектов, но не массивом дат или ObjectId.
      ? { type: [IModelDefinition<U>]; required: false } // Если массив объектов, то выводим (делаем infer) тип объекта и делаем по нему рекурсию, а также рекурсию помещаем в { type: [...]; required: false }.
      : never // Если не массив объектов. Вряд ли до сюда дойдем.
    : Required<T>[P] extends object
    ? Pick<T, P> extends Required<Pick<T, P>>
      ? IModelDefinition<Required<T>[P]> // Делаем рукурсию типа, если текущий проп — объект и не является массивом.
      : { type: IModelDefinition<Required<T>[P]>; required: false } // Делаем рукурсию типа, если текущий проп — объект и не является массивом.
    : never; // Если не примитив, не массив и не объект. Вряд ли до сюда дойдем.
};

type ITestModelDefinition = IModelDefinition<{
  test?: string;
  test2: string;
  test3: {
    test4: string;
    test5?: string[];
  };
  test6?: {
    test7: string;
    test8?: string;
  }[];
  test9?: {
    test10: string;
    test11?: string;
  };
}>;
const testModelDefinition1: ITestModelDefinition = {
  test: {
    type: String,
  },
  test2: {
    type: String,
    required: true,
    trim: true,
  },
  test3: {
    test4: {
      type: String,
      required: true,
    },
    test5: {
      type: [String],
    },
  },
  test6: {
    type: [
      {
        test7: {
          type: String,
          required: true,
        },
        test8: {
          type: String,
        },
      },
    ],
    required: false,
  },
  test9: {
    type: {
      test10: {
        type: String,
        required: true,
      },
      test11: {
        type: String,
      },
    },
    required: false,
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// Common //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
export type IPrimitive = boolean | number | bigint | string | symbol;

/**
 * Сделать опциональные параметры типа T обязательными с типом T | undefined.
 * { a: string; b?: string; c: string | undefined; } → { a: string; b: string | undefined; c: string | undefined; }
 */
export type IComplete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined;
};
type ITestComplete = IComplete<{
  key1: number;
  key2: number | undefined;
  key3?: string;
  key4?: string;
  key5?: undefined;
  key6?: null;
  key7: undefined;
  key8: null;
}>;
const testComplete: ITestComplete = {
  key1: 1,
  key2: 1,
  key3: "",
  key4: "",
  key5: undefined,
  key6: null,
  key7: undefined,
  key8: null,
};
type ITestComplete2 = {
  foo: number;
  bar?: number;
  baz: number | undefined;
};
const testComplete2: ITestComplete2 = {
  foo: NaN,
  baz: undefined,
};
const testComplete3: IComplete<ITestComplete2> = {
  foo: NaN,
  bar: undefined,
  baz: undefined,
};

/**
 * Сделать опциональные параметры типа T обязательными с типом T | undefined.
 * { a: string; b?: string; c: string | undefined; } → { a: string; b: string | undefined; c: string | undefined; }
 *
 * Нет уверенности в коррекции этой функции. У нее более непонятная реализация по сравнению с IComplete<T>.
 */
export type IOptToUndef<T> = {
  [K in keyof Required<T>]: T[K] | ({} extends Pick<T, K> ? undefined : never);
};
type testOptToUndef = IOptToUndef<{
  test?: string;
}>;

/**
 * Сделать опциональные и "| undefined" параметры обязательными с заданным типом.
 * { one?: string; two: string; three: string | undefined; } → { one: number; two: number; three: number; }
 */
export type IRequiredWithType<T, V> = {
  [P in keyof T]-?: V;
};
type ITestRequiredWithType = {
  one?: string;
  two: string;
  three: string | undefined;
};
type ITestRequiredWithTypeNumber = IRequiredWithType<
  ITestRequiredWithType,
  number
>;

/**
 * Вернуть тип элемента в массиве элементов.
 * type A = ArrayElement<string[]>; // string
 * type B = ArrayElement<readonly string[]>; // string
 * type C = ArrayElement<[string, number]>; // string | number
 * type D = ArrayElement<["foo", "bar"]>; // "foo" | "bar"
 * type E = ArrayElement<(P | (Q | R))[]>; // P | Q | R
 * SRC: Typescript: Retrieve element type information from array type | https://stackoverflow.com/questions/41253310/typescript-retrieve-element-type-information-from-array-type
 */
export type IArrayElement<A> = A extends readonly (infer T)[] ? T : never;

/**
 * Remove types from T that are assignable to U
 */
export type IDiff<T, U> = T extends U ? never : T;

/**
 * Remove types from T that are not assignable to U
 */
export type IFilter<T, U> = T extends U ? T : never;

/**
 * Remove null and undefined from T
 */
export type INonNullable<T> = IDiff<T, null | undefined>;

/**
 * Пересечение пропов типов.
 *
 * Examples:
 *
 * A = { x: number; y: string; } и B = { y: string; z: boolean; }  →  { y: string; }
 * A = { x: number; y: string; } и B = { y: boolean; }  →  { }
 *
 * Если в результате получили { }, то, возможно, результат стоит поместить в IWithoutEmptyObjectProps<сюда>, либо сравнить с Record<string, never> (с пустым объектом).
 */
export type ICommonProps<A, B> = {
  [K in keyof A & keyof B]: A[K] | B[K];
};
const testCommonProps: ICommonProps<
  { y: number; x: string },
  { y: number; z: boolean }
> = {
  y: 123,
};
type ITestCommonProps<T> = T extends ICommonProps<T, {}> ? string : number;
const testTestCommonProps: ITestCommonProps<{ a: 4 }> = "4";

/**
 * Оставить в типе пропы заданного типа.
 *
 * Examples:
 *
 * IPickByType<{ x: number; y: string; z: null; }, number>  →  { x: number; }
 * IPickByType<{ x: number; y: string; z: null; }, number | null>  →  { x: number; z: null; }
 */
export type IPickByType<T, U> = Pick<T, IKeysOfType<T, U>>;

/**
 * Убрать из типа пропы заданного типа. Во всех вложенных пропах.
 *
 * Examples:
 *
 * IPickByTypeDeep<{ x: number; y: string; z: { a: null; b: number; c: number[]; d: Date; }; }, number>  →  { x: number; z: { b: number; }; }
 * IPickByTypeDeep<{ x: number; y: string; z: { a: null; b: number; c: number[]; d: Date; }; }, number | null | Date>  →  { x: number; z: { a: null; b: number; d: Date; }; }
 */
export type IPickByTypeDeep<T, U> = {
  [P in keyof IPickByType<T, U>]: T[P] extends object
    ? IPickByTypeDeep<T[P], U>
    : T[P];
};

/**
 * Палучить все ключи типа с заданным типом.
 *
 * Examples:
 *
 * IKeysOfType<{ a: number; b: boolean; c: null; }, boolean | null>  →  "b" | "c"
 */
export type IKeysOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

/**
 * Убрать из типа пропы заданного типа.
 *
 * Examples:
 *
 * IOmitByType<{ x: number; y: string; z: null; }, number>  →  { y: string; z: null; }
 * IOmitByType<{ x: number; y: string; z: null; }, number | null>  →  { y: string; }
 *
 * NEW TYPESCRIPT WAY
 * type OmitByType<T, U> = {
 *   [P in keyof T as T[P] extends U ? never : P]: T[P];
 * };
 */
export type IOmitByType<T, U> = Pick<T, IKeysNotOfType<T, U>>;

/**
 * Убрать из типа пропы заданного типа. Во всех вложенных пропах.
 *
 * Examples:
 *
 * IOmitByType<{ x: number; y: string; z: { a: null; b: number; c: number[]; d: Date; }; }, number>  →  { y: string; z: { a: null; c: number[]; d: Date; }; }
 * IOmitByType<{ x: number; y: string; z: { a: null; b: number; c: number[]; d: Date; }; }, number | null | Date>  →  { y: string; z: { c: number[]; }; }
 *
 * NEW TYPESCRIPT WAY
 * type OmitByType<T, U> = {
 *   [P in keyof T as T[P] extends U ? never : P]: T[P];
 * };
 */
export type IOmitByTypeDeep<T, U> = {
  [P in keyof IOmitByType<T, U>]: T[P] extends object
    ? IOmitByTypeDeep<T[P], U>
    : T[P];
};
const testOmitByTypeDeep: IOmitByTypeDeep<{ a: number; b: never }, never> = {
  a: 1,
};

/**
 * Палучить все ключи типа, тип которых отличен от заданного.
 *
 * Examples:
 *
 * IKeysNotOfType<{ a: number; b: boolean; c: null; }, boolean>  →  "a" | "c"
 */
export type IKeysNotOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? never : P;
}[keyof T];

/**
 * Палучить все ключи типа.
 *
 * Examples:
 *
 * IAllKeys<{ a: number; b: boolean; }>  →  "a" | "b"
 */
export type IAllKeys<T> = {
  [P in keyof T]: P;
}[keyof T];
let testAllKeys: IAllKeys<{ a: 3; b: true }> = "a"; // "b";

/**
 * Является ли тип пустым объектом.
 * Демонстрация.
 */
export type IIsEmptyObject<T> = T extends Record<string, never> ? true : never;
// const testIsEmptyObject_1: IIsEmptyObject<{ t: 123 port }> = // never
const testIsEmptyObject_2: IIsEmptyObject<{}> = true;

export type IWithoutEmptyObjectProps<T> = {
  [P in keyof IOmitByType<T, Record<string, never>>]: T[P]; // extends Record<string, never> ? never : T[P]
};
const testWithoutEmptyObjectProps: IWithoutEmptyObjectProps<{
  a: number;
  b: {};
}> = { a: 1 };

export type IWithoutEmptyObjectPropsDeep<T> = IOmitByTypeDeep<
  T,
  Record<string, never>
>;
const testWithoutEmptyObjectPropsDeep: IWithoutEmptyObjectPropsDeep<{
  a: number;
  b: { g: number; bb: object };
  c: { dd: {}; ee: null; ff: { ggg: {} } };
  d: Record<string, never>;
}> = { a: 1, b: { g: NaN, bb: { xyz: "" } }, c: { ee: null, ff: { n: 1 } } };

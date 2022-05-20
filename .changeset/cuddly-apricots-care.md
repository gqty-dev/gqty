---
'@gqty/cli': minor
---

A new option `enumsAsConsts` is added to the `GQtyConfig`

Here's a sample of how it differs from `enum`

```ts
enum Enum {
  A_B_C = 'A_B_C',
  X_Y_Z = 'X_Y_Z',
  _TEST = '_TEST',
  My_Value = 'My_Value',
}

export const EnumAsConst = {
  ABC: 'A_B_C',
  XYZ: 'X_Y_Z',
  Test: '_TEST',
  MyValue: 'My_Value',
} as const;
export type EnumAsConst = typeof EnumAsConst[keyof typeof EnumAsConst];

function useEnum(value: Enum) {}
function useEnumAsConst(value: EnumAsConst) {}

useEnum(Enum.A_B_C); // Ok
useEnum('A_B_C'); // Error: Argument of type '"A_B_C"' is not assignable to parameter of type 'Enum'.

useEnumAsConst(Enum.A_B_C); // Ok
useEnumAsConst(EnumAsConst.ABC); // Ok
useEnumAsConst('A_B_C'); // Ok
```

See also:

- [Ben Lesh on Twitter: "I've run across this pattern for enums in TypeScript..."](https://twitter.com/BenLesh/status/1510983348944056327/)
- [Replacing Enums With Unions](https://www.tomche.space/post/replacing-enums-with-unions/)

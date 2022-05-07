/**
 * # Using Enums
 *
 * When your emun is defined just to be supplied as parameter into some other functions. Continue using it.
 *
 */
// @playground-link
enum MyEnumUserType {
  ADMIN,
  UNKNOWN,
  REGISTERED,
}
const processUserData = (data: any, userType: MyEnumUserType) => {
  if (userType === MyEnumUserType.ADMIN) {
    console.log(`Admin data:`, data);
  } else if (userType == MyEnumUserType.REGISTERED) {
    console.log(`Registered user data:`, data);
  } else {
    console.log(`Unknown data:`, data);
  }
};
processUserData({ test: 1 }, MyEnumUserType.ADMIN);
processUserData({ test: 2 }, MyEnumUserType.UNKNOWN);
/**
 * In such situations it is usually created (hardcoded) and compared with the same enum values.
 * No types conversion happening
 *
 * ## Problems with enums
 *
 * Starts when enum values are converted. It is not a big deal to print values, you can assign string or number
 * to the corresponding key. But parsing string into enum looks "strange"
 *
 * Given a situation when `MyEnumUserType` is now read out of an input, usually some string.
 */
const myUserType: string = "ADMIN";
const myUserInEnumType: MyEnumUserType =
  MyEnumUserType[myUserType as keyof typeof MyEnumUserType];
processUserData({ test: 3 }, myUserInEnumType);
/**
 * Now, the function can be called but `as keyof typeof` looks as not needed, but required.
 *
 * # When to use union types instead of enum
 *
 * `MyEnumUserType` defined with union type:
 */
type UnionUserType = "ADMIN" | "REGISTERED" | "UNKNOWN";
/**
 * This is not so convinent because those hardcoded string constants are set as strings everywhere.
 *
 * So here is upgraded and more flexible version:
 */
// @playground-link
const TypeAdmin = "ADMIN";
const TypeUnknown = "UNKNOWN";
const TypeRegistered = "REGISTERED";

type UpgradedUserType = typeof TypeAdmin | typeof TypeAdmin | typeof TypeAdmin;

const myUserTypeAgain: string = "ADMIN"; // just a string
const adminAssignedDirectly: UpgradedUserType = "ADMIN"; // already enum value

const exportUserType = (userType: UpgradedUserType) => console.log(userType);

const parseUserType = (userType: string): UpgradedUserType =>
  userType as UpgradedUserType;

/**
 * # Summary
 *
 * Use `enum` when it is not leaving codebase.
 *
 * Use `union type` as union replacement when your keys are parsed from some input.
 */

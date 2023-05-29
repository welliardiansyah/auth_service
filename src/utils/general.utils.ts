import { Platform } from 'src/database/enums/roles.enum';

export class Utils {
  /**
   *
   * @param text string with underscore format ex: "user_test"
   * @returns text with formatted and first char is uppercased ex: "User Test"
   */
  static formatUnderscoreToWord(text: string) {
    const splits = text.split('_').map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return splits.join(' ');
  }

  static getPlatformEnum(type: string): Platform[] {
    switch (type) {
      case 'SUPERADMIN':
        return [Platform.SUPERADMIN];
      case 'STORES':
        return [Platform.STORES];
      case 'CUSTOMER':
        return [Platform.CUSTOMER];
      default:
        // return all enums
        return [
          Platform.NONE,
          Platform.SUPERADMIN,
          Platform.STORES,
          Platform.CUSTOMER,
        ];
    }
  }
}

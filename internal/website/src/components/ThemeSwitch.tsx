import { IconButton } from '@chakra-ui/react';
import { useThemeContext } from '@theguild/components';
import { BsMoonFill, BsSun } from 'react-icons/bs';

export function ThemeSwitch() {
  const { setDarkTheme, isDarkTheme } = useThemeContext();

  if (!setDarkTheme) return null;

  return (
    <IconButton
      variant="outline"
      aria-label="Theme Switch"
      icon={isDarkTheme ? <BsMoonFill /> : <BsSun />}
      onClick={() => setDarkTheme((state) => !state)}
    />
  );
}

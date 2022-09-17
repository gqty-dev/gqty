import {
  Box,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Spinner,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { HiOutlineMenu } from 'react-icons/hi';
import { Sidebar } from './Sidebar';

const Topbar = () => {
  const { isOpen, onClose, onOpen } = useMobileMenuState();
  return (
    <Flex
      align="center"
      justify="space-between"
      py="2"
      px="4"
      display={{ base: 'flex', md: 'none' }}
      borderBottomWidth="1px"
    >
      <IconButton
        onClick={onOpen}
        variant="unstyled"
        display="flex"
        cursor="pointer"
        aria-label="Menu"
        icon={<HiOutlineMenu fontSize="1.5rem" />}
      />
      <Drawer
        size="xs"
        placement="left"
        isOpen={isOpen}
        blockScrollOnMount={false}
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent shadow="none" position="relative" maxW="64">
          <Sidebar width="full" height="full" bg="inherit" border="0" />
          <DrawerCloseButton
            bg="blue.500"
            _hover={{ bg: 'blue.600' }}
            _active={{ bg: 'blue.700' }}
            rounded="0"
            position="absolute"
            color="white"
            right="-8"
            top="0"
          />
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

let globalIsClientSide = false;

export function WithExamplePage<T extends JSX.IntrinsicAttributes>(Cmp: FC<T>) {
  return function WithExamplePage(props: T) {
    const [isClientSide, setIsClientSide] = useState(globalIsClientSide);

    useEffect(() => {
      if (isClientSide) return;

      setIsClientSide((globalIsClientSide = true));
    }, [isClientSide, setIsClientSide]);

    if (!isClientSide) return <Spinner margin="1em" boxSize="xl" />;
    return (
      <Flex flexDirection="column" width="100%">
        <Topbar />
        <Flex flex="1" m="2px" paddingX={['1em', '2em', '2em', '5em']}>
          <Sidebar display={{ base: 'none', md: 'flex' }} />

          <Box
            overflowY="auto"
            borderWidth="2px"
            p="2rem"
            h="full"
            w="full"
            position="relative"
            children={<Cmp {...props} />}
          />
        </Flex>
      </Flex>
    );
  };
}

const useMobileMenuState = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  useEffect(() => {
    if (isMobile == false) {
      onClose();
    }
  }, [isMobile, onClose]);
  return { isOpen, onClose, onOpen };
};

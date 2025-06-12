import React, { useState } from 'react';
import {
  VStack,
  Box,
  Text,
  Button,
  Divider,
  Icon,
  HStack,
  useColorModeValue,
  Collapse,
  Flex,
  Badge,
  Avatar,
  Tooltip,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  useBreakpointValue,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  List,
  ListItem,
  ListIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { 
  FaGraduationCap, 
  FaPlus, 
  FaChevronDown, 
  FaChevronUp,
  FaHistory,
  FaBars,
  FaTimes,
  FaUser,
  FaInfoCircle,
  FaRocket,
  FaBrain,
  FaHeart,
  FaTrash
} from 'react-icons/fa';
import { LeemboLogo } from './LeemboLogo';

export function SessionSidebar({
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
  onQuestionSelect,
  userName,
  isOpen,
  onToggle,
  onDeleteSession
}) {
  const [showHistory, setShowHistory] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  
  // For delete confirmation dialog
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = React.useRef();
  
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const thumbColor = useColorModeValue('gray.300', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  const aboutBg = useColorModeValue('blue.50', 'blue.900');

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Handler for delete button click
  const handleDeleteClick = (e, session) => {
    e.stopPropagation(); // Prevent session selection when clicking delete
    setSessionToDelete(session);
    onDeleteAlertOpen();
  };

  // Confirm session deletion
  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete.id);
      onDeleteAlertClose();
      setSessionToDelete(null);
    }
  };

  // Determine if we should use mobile drawer or desktop sidebar
  const isMobile = useBreakpointValue({ base: true, md: false });

  const sidebarContent = (
    <VStack spacing={4} align="stretch" p={4} h="100%">
      {/* Leembo.AI Logo with more compact spacing */}
      <Box 
        py={2}
        display="flex" 
        justifyContent="center"
        alignItems="center"
      >
        <LeemboLogo 
          size="sm" 
          onClick={() => {
            onNewSession();
            if (isMobile) {
              onToggle();
            }
          }} 
        />
      </Box>
      
      <Divider my={1} />
      
      {/* New Chat Button - more compact */}
      <Button
        leftIcon={<FaPlus />}
        colorScheme="blue"
        size="sm"
        onClick={onNewSession}
        mb={1}
        borderRadius="md"
        py={1}
        h="32px"
      >
        New Learning Session
      </Button>

      <Divider />

      {/* Session History - With scrollbar */}
      <Box flex="1" overflowY="auto" mt={2}>
        <Flex 
          justify="space-between" 
          align="center" 
          bg={sectionBg} 
          p={1.5} 
          px={2}
          borderRadius="md"
          onClick={() => setShowHistory(!showHistory)}
          cursor="pointer"
          _hover={{ bg: hoverBg }}
        >
          <HStack spacing={1}>
            <Icon as={FaHistory} color="blue.500" boxSize={3} />
            <Text fontWeight="medium" fontSize="sm">
              Learning History
            </Text>
            {sessions.length > 0 && (
              <Badge colorScheme="blue" borderRadius="full" fontSize="xs" px={1.5}>
                {sessions.length}
              </Badge>
            )}
          </HStack>
          <IconButton
            icon={showHistory ? <FaChevronUp /> : <FaChevronDown />}
            variant="ghost"
            size="xs"
            aria-label={showHistory ? "Hide history" : "Show history"}
            onClick={(e) => {
              e.stopPropagation();
              setShowHistory(!showHistory);
            }}
          />
        </Flex>
        <Collapse in={showHistory} animateOpacity>
          <VStack 
            align="stretch" 
            spacing={1} 
            mt={1} 
            maxH="calc(100vh - 220px)"
            overflowY="auto"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: thumbColor,
                borderRadius: '24px',
              },
            }}
          >
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <Box
                  key={session.id}
                  bg={session.id === currentSession?.id ? activeBg : 'transparent'}
                  borderRadius="md"
                  borderLeft={session.id === currentSession?.id ? "3px solid" : "none"}
                  borderColor="blue.500"
                  overflow="hidden"
                  onClick={() => {
                    onSessionSelect(session);
                    if (isMobile) {
                      onToggle();
                    }
                  }}
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  transition="all 0.2s"
                >
                  <Flex py={1.5} px={2} align="center">
                    <Avatar 
                      icon={<FaGraduationCap fontSize="0.6rem" />} 
                      bg="blue.100" 
                      color="blue.800" 
                      size="xs" 
                      mr={2}
                    />
                    <Box flex="1" pr={1}>
                      <Tooltip label={session.topic} placement="top" hasArrow>
                        <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                          {session.topic}
                        </Text>
                      </Tooltip>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="xs" color="gray.500">
                          {session.assessment?.level || "Beginner"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatDate(session.timestamp)}
                        </Text>
                      </Flex>
                    </Box>
                    <IconButton
                      icon={<FaTrash />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      opacity="0.7"
                      onClick={(e) => handleDeleteClick(e, session)}
                      aria-label="Delete session"
                      _hover={{ opacity: 1 }}
                    />
                  </Flex>
                </Box>
              ))
            ) : (
              <Text fontSize="xs" color="gray.500" p={2}>
                No learning sessions yet
              </Text>
            )}
          </VStack>
        </Collapse>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="lg">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Learning Session
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the session on "{sessionToDelete?.topic}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose} borderRadius="md">
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDeleteSession} 
                ml={3}
                borderRadius="md"
                leftIcon={<FaTrash />}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* About Us section - More compact */}
      <Box mt="auto" mb={1}>
        <Button
          variant="ghost"
          leftIcon={<Icon as={FaInfoCircle} color="blue.500" boxSize={3} />}
          size="xs"
          width="full"
          justifyContent="left"
          onClick={() => setShowAboutModal(true)}
          borderRadius="md"
          py={2}
          fontWeight="medium"
          _hover={{ bg: hoverBg }}
        >
          About Us
        </Button>
      </Box>

      {/* User info at bottom of sidebar - More compact */}
      {userName && (
        <Box 
          bg={sectionBg} 
          py={1.5}
          px={2}
          borderRadius="md"
          mb={1}
        >
          <HStack spacing={2}>
            <Avatar 
              size="xs" 
              bg="blue.500" 
              color="white" 
              name={userName} 
              icon={<Icon as={FaUser} boxSize={3} />}
            />
            <Text fontWeight="medium" fontSize="xs">
              {userName}
            </Text>
          </HStack>
        </Box>
      )}

      {/* About Us Modal */}
      <Modal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader bg={aboutBg} borderTopRadius="xl">
            <Flex align="center">
              <Icon as={FaGraduationCap} mr={2} boxSize={6} color="blue.500" />
              <Text>About Leembo.AI</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={6}>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" fontWeight="medium">
                "We're not just another learning platform; we're your personal brain upgrade station!" 🧠✨
              </Text>
              
              <Box>
                <Heading size="sm" mb={2} color="blue.500">Our Story</Heading>
                <Text>
                  <b>Leembo.AI</b> was born one caffeine-fueled night when our founder realized that 
                  traditional learning was about as exciting as watching paint dry. We decided 
                  there had to be a more fun way to become smarter without falling asleep on your keyboard.
                </Text>
              </Box>
              
              <Box>
                <Heading size="sm" mb={2} color="blue.500">What Makes Us Different</Heading>
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={FaRocket} color="green.500" />
                    Our AI doesn't just answer questions; it actually understands when you're confused (even before you do)
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaBrain} color="purple.500" />
                    We adapt to your learning style faster than you can say "cognitive behavioral adaptation methodology" (try saying that three times fast)
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaHeart} color="red.500" />
                    We genuinely care about your learning journey (our AI gets sad when you don't come back to learn)
                  </ListItem>
                </List>
              </Box>
              
              <Box>
                <Heading size="sm" mb={2} color="blue.500">Our Mission</Heading>
                <Text fontStyle="italic">
                  "To make learning so addictive that people choose education over scrolling social media. Ambitious? Yes. Impossible? Watch us."
                </Text>
              </Box>
              
              <Divider />
              
              <Flex direction="column" align="center" justify="center" py={3}>
                <Text fontWeight="bold" color="blue.600">Samiullah Saleem</Text>
                <Text fontSize="sm" color="gray.500">CEO & Founder</Text>
                <Text fontSize="xs" mt={4} textAlign="center" fontStyle="italic">
                  "If education is boring, you're doing it wrong. Let's fix that together."
                </Text>
              </Flex>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setShowAboutModal(false)} colorScheme="blue" borderRadius="md">
              Back to Learning
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          icon={<FaBars />}
          aria-label="Open sidebar"
          position="fixed"
          left={4}
          top={4}
          zIndex={20}
          onClick={onToggle}
          variant="ghost"
          display={isOpen ? "none" : "flex"}
        />
        
        <Drawer isOpen={isOpen} placement="left" onClose={onToggle} size="full">
          <DrawerOverlay />
          <DrawerContent>
            <IconButton
              icon={<FaTimes />}
              aria-label="Close sidebar"
              position="absolute"
              right={4}
              top={4}
              zIndex={20}
              onClick={onToggle}
              variant="ghost"
            />
            <DrawerBody p={0}>
              {sidebarContent}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      w={isOpen ? "300px" : "0"}
      h="100vh"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      position="fixed"
      left={0}
      top={0}
      overflowY="auto"
      transition="width 0.3s ease"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: thumbColor,
          borderRadius: '24px',
        },
      }}
    >
      {isOpen && sidebarContent}
      
      <IconButton
        icon={isOpen ? <FaTimes /> : <FaBars />}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        position="fixed"
        left={isOpen ? "304px" : "4px"}
        top={6}
        zIndex={50}
        onClick={onToggle}
        size="sm"
        transition="left 0.3s ease"
      />
    </Box>
  );
}
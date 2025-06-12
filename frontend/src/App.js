import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Container,
  VStack,
  Text,
  Input,
  Button,
  useToast,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Icon,
  useColorModeValue,
  useDisclosure,
  Flex,
  Grid,
  GridItem,
  Badge,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react';
import { FaSearch, FaRocket, FaBirthdayCake, FaBook } from 'react-icons/fa';
import { LearningResults } from './components/LearningResults';
import { SessionSidebar } from './components/SessionSidebar';
import { HistoryCards } from './components/HistoryCards';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoadingAnimation } from './components/LoadingAnimation';
import { HotTopicsSidebar } from './components/HotTopicsSidebar';
import { RecommendedCourses } from './components/RecommendedCourses';
import axios from 'axios';

// Fallback suggested questions if API fails
const FALLBACK_QUESTIONS = [
  "What is machine learning and how does it work?",
  "Explain the basics of web development",
  "How does blockchain technology function?",
  "What are the fundamentals of data structures?",
  "Teach me about artificial intelligence",
  "What is quantum computing?",
  "Explain cloud computing architecture",
  "How does cybersecurity work?",
];

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userPreferences, setUserPreferences] = useState([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('learning_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSession, setCurrentSession] = useState(null);
  const [topicKey, setTopicKey] = useState(Date.now()); // Add this line to create a unique key
  const toast = useToast();
  
  // API URL - in production, this would come from env variable
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Sidebar control
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultIsOpen: true });

  // Define color mode values upfront - React Hooks must be called unconditionally
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const modalHeaderBg = useColorModeValue("blue.50", "blue.900");
  const mainBg = useColorModeValue("gray.50", "gray.900");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const tagBgColor = useColorModeValue('blue.50', 'blue.900');

  // Function to get appropriate greeting based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Check if user has already entered their data
  useEffect(() => {
    // Try to load user data from localStorage
    const savedUserData = localStorage.getItem('eduMentor_userData');
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        setUserName(userData.name || '');
        setUserAge(userData.age || '');
        setUserPreferences(userData.preferences || []);
        setShowWelcome(false);
      } catch (e) {
        // Fallback to just the name if JSON parsing fails
        const savedName = localStorage.getItem('eduMentor_userName');
        if (savedName) {
          setUserName(savedName);
          setShowWelcome(false);
        }
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('learning_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const handleWelcomeComplete = (name, age, preferences) => {
    setUserName(name);
    setUserAge(age || '');
    setUserPreferences(preferences || []);
    
    // Smooth transition
    setTimeout(() => {
      setShowWelcome(false);
      
      // Welcome toast
      toast({
        title: `Welcome, ${name}!`,
        description: "I'm Leembo.AI, your personal learning assistant. What would you like to learn today?",
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }, 600);
  };

  const resetState = () => {  
    setTopic('');
    setResults(null);
    setAssessment(null);
    setShowAssessmentModal(false);
    setCurrentSession(null);
    setTopicKey(Date.now()); // Generate a new key to force remounting
    setLoading(false); // Make sure loading is also reset
  };

  const handleNewSession = () => {
    resetState();
  };

  const handleSessionSelect = (session) => {
    setCurrentSession(session);
    setTopic(session.topic);
    setResults(session.results);
    setTopicKey(Date.now()); // Generate a new key to force remounting
  };

  const handleQuestionSelect = (question) => {
    setTopic(question);
    handleGetAssessment(question);
  };

  // Function to delete a session
  const handleDeleteSession = (sessionId) => {
    console.log("Deleting session with ID:", sessionId);
    
    // Filter out the session with the specified ID
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    
    // Update the sessions state
    setSessions(updatedSessions);
    
    // If the current session is the one being deleted, reset the view
    if (currentSession && currentSession.id === sessionId) {
      resetState();
    }
    
    // Show success notification
    toast({
      title: 'Session deleted',
      description: 'Your learning session has been successfully removed',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleGetAssessment = async (selectedTopic = topic) => {
    if (!selectedTopic.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a topic to learn about',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Reset results and current session when starting a new search
    setResults(null);
    setCurrentSession(null);
    setTopicKey(Date.now()); // Generate a new key to force remounting
    
    // Set loading to true BEFORE making the API call
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/assess`, {
        topic: selectedTopic.trim(),
        userAge: userAge,
        userPreferences: userPreferences
      });
      setAssessment(response.data);
      setShowAssessmentModal(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleAssessmentSubmit = async (modifiedAssessment) => {
    setShowAssessmentModal(false);
    // Keep loading true when assessment is submitted
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/learn`, {
        topic: topic.trim(),
        assessment: modifiedAssessment,
        userAge: userAge,
        userPreferences: userPreferences
      });
      
      // Create new session
      const newSession = {
        id: Date.now(),
        topic: topic.trim(),
        timestamp: new Date().toISOString(),
        results: response.data,
        assessment: modifiedAssessment,
        userAge: userAge,
        userPreferences: userPreferences
      };

      // Update sessions list
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setResults(response.data);
      setTopicKey(Date.now()); // Generate a new key to force remounting
      
      // Show a personalized welcome message
      toast({
        title: 'Learning session started!',
        description: `I've prepared materials for ${topic} tailored to your ${modifiedAssessment.level} level and ${modifiedAssessment.style} learning style.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to update user profile
  const handleUpdateUserProfile = (name, age, preferences) => {
    // Update state
    setUserName(name);
    setUserAge(age);
    setUserPreferences(preferences);
    
    // Store updated data in localStorage
    const userData = {
      name: name.trim(),
      age: age || '',
      preferences: preferences || []
    };
    
    localStorage.setItem('eduMentor_userData', JSON.stringify(userData));
    localStorage.setItem('eduMentor_userName', name.trim());
    
    // Close modal
    setShowUserProfileModal(false);
    
    // Show success notification
    toast({
      title: 'Profile Updated',
      description: 'Your learning profile has been successfully updated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Function to get Age Display
  const getAgeDisplay = () => {
    if (!userAge) return "Not specified";
    
    const age = parseInt(userAge);
    if (age < 13) return `${userAge} (Elementary)`;
    if (age < 18) return `${userAge} (Teen)`;
    return userAge;
  };

  return (
    <ChakraProvider>
      {showWelcome ? (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      ) : (
        <Box minH="100vh" bg={mainBg}>
          {/* Left Sidebar */}
          <SessionSidebar
            sessions={sessions}
            currentSession={currentSession}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
            onQuestionSelect={handleQuestionSelect}
            userName={userName}
            userAge={userAge}
            userPreferences={userPreferences}
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            onDeleteSession={handleDeleteSession}
            onEditProfile={() => setShowUserProfileModal(true)}
            showTrendingTopics={false}
          />

          {/* Main Content + Right Sidebar */}
          <Box 
            pl={isSidebarOpen ? "300px" : "0"} 
            pt="6" 
            pb="6"
            transition="padding-left 0.3s ease"
          >
            <Container maxW="container.xl" px={4}>
              <Grid
                templateColumns={{ base: "1fr", lg: "3fr 1fr" }}
                gap={6}
              >
                {/* Main Content Area */}
                <GridItem>
                  <VStack spacing={6} align="stretch">
                    {/* Welcome message above the question input */}
                    <Flex
                      justify="space-between"
                      align="flex-start"
                      w="100%"
                      px={4}
                      py={6}
                    >
                      {/* Left side: Greeting and Subtext */}
                      <Box>
                        <Flex align="center" mb={2}>
                          <Text fontSize="4xl" fontWeight="bold" color={accentColor}>
                            {getTimeBasedGreeting()}, {userName}!
                          </Text>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowUserProfileModal(true)}
                            ml={2}
                            borderRadius="md"
                          >
                            ✏️
                          </Button>
                        </Flex>
                        <Text fontSize="xl" color="gray.600">
                          What's cooking in your brain kitchen today?
                        </Text>
                        
                        {/* User profile badges */}
                        <HStack mt={2} spacing={2}>
                          {userAge && (
                            <Badge colorScheme="purple" p={1} borderRadius="md">
                              <Flex align="center">
                                <Icon as={FaBirthdayCake} mr={1} />
                                <Text>{getAgeDisplay()}</Text>
                              </Flex>
                            </Badge>
                          )}
                          
                          {userPreferences.length > 0 && (
                            <Badge colorScheme="blue" p={1} borderRadius="md">
                              <Flex align="center">
                                <Icon as={FaBook} mr={1} />
                                <Text>{userPreferences.length} Interests</Text>
                              </Flex>
                            </Badge>
                          )}
                        </HStack>
                      </Box>

                      {/* Right side: Date pushed lower */}
                      <Box mt="auto" pl={4}>
                        <Text fontSize="md" color="gray.500" whiteSpace="nowrap" mt={8}>
                          {new Date().toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </Box>
                    </Flex>

                    {/* Question input section */}
                    <Box 
                      bg={cardBg} 
                      p={6} 
                      borderRadius="xl" 
                      boxShadow="md"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <VStack spacing={4}>
                        <InputGroup size="lg">
                          <Input
                            placeholder="What would you like to learn about?"
                            size="lg"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleGetAssessment()}
                            pr="4.5rem"
                            borderRadius="lg"
                            boxShadow="sm"
                          />
                          <InputRightElement width="4.5rem">
                            <Icon as={FaSearch} color="gray.500" />
                          </InputRightElement>
                        </InputGroup>
                        <HStack width="full">
                          <Button
                            colorScheme="blue"
                            size="lg"
                            flex="1"
                            onClick={() => handleGetAssessment()}
                            isLoading={loading}
                            loadingText="Processing..."
                            leftIcon={<FaRocket />}
                            borderRadius="lg"
                            boxShadow="sm"
                          >
                            Start Learning
                          </Button>
                          {results && (
                            <Button
                              colorScheme="gray"
                              size="lg"
                              onClick={resetState}
                              isDisabled={loading}
                              borderRadius="lg"
                            >
                              New Topic
                            </Button>
                          )}
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Loading Animation - Show this when loading is true */}
                    {loading && (
                      <LoadingAnimation message={`Preparing a ${topic} learning experience just for you, ${userName}...`} />
                    )}

                    {/* Results or History - Only show one of these at a time */}
                    {results ? (
                      <LearningResults 
                        key={topicKey} 
                        results={results} 
                        onReset={resetState} 
                        userName={userName}
                        userAge={userAge}
                        userPreferences={userPreferences}
                      />
                    ) : (
                      /* Only show the recent sessions and recommended courses when not loading */
                      !loading && (
                        <>
                          {/* Recent Learning Sessions */}
                          <Box 
                            p={6} 
                            bg={cardBg} 
                            borderRadius="xl" 
                            boxShadow="md"
                            borderWidth="1px"
                            borderColor={borderColor}
                          >
                            <HistoryCards 
                              sessions={sessions} 
                              onSessionSelect={handleSessionSelect} 
                              onDeleteSession={handleDeleteSession}
                            />
                          </Box>
                          
                          {/* Recommended Video Courses - show below history cards */}
                          <Box 
                            mt={6}
                            p={6} 
                            bg={cardBg} 
                            borderRadius="xl" 
                            boxShadow="md"
                            borderWidth="1px"
                            borderColor={borderColor}
                          >
                            <RecommendedCourses 
                              userPreferences={userPreferences}
                              currentTopic={topic} 
                            />
                          </Box>
                        </>
                      )
                    )}
                  </VStack>
                </GridItem>

                {/* Right Sidebar - Hot Topics */}
                <GridItem display={{ base: "none", lg: "block" }}>
                  <HotTopicsSidebar 
                    suggestedQuestions={FALLBACK_QUESTIONS} 
                    onQuestionSelect={handleQuestionSelect}
                    userPreferences={userPreferences}
                    userAge={userAge}
                  />
                </GridItem>
              </Grid>
            </Container>
          </Box>

          {/* Assessment Approval Modal */}
          <Modal
            isOpen={showAssessmentModal}
            onClose={() => {
              setShowAssessmentModal(false);
              setLoading(false); // Make sure to reset loading when modal is closed
            }}
            isCentered
          >
            <ModalOverlay />
            <ModalContent borderRadius="xl">
              <ModalHeader bg={modalHeaderBg} borderTopRadius="xl">
                Customize Your Learning Experience
              </ModalHeader>
              <ModalBody pt={6}>
                <VStack spacing={4}>
                  <Text>
                    Based on the topic "{topic}", I recommend these learning settings for you, {userName}:
                  </Text>
                  {assessment && (
                    <>
                      <FormControl>
                        <FormLabel>Knowledge Level</FormLabel>
                        <Select
                          value={assessment.assessment.level}
                          onChange={(e) =>
                            setAssessment({
                              ...assessment,
                              assessment: {
                                ...assessment.assessment,
                                level: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Learning Style</FormLabel>
                        <Select
                          value={assessment.assessment.style}
                          onChange={(e) =>
                            setAssessment({
                              ...assessment,
                              assessment: {
                                ...assessment.assessment,
                                style: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="Visual">Visual</option>
                          <option value="Auditory">Auditory</option>
                          <option value="Reading">Reading</option>
                          <option value="Kinesthetic">Kinesthetic</option>
                        </Select>
                      </FormControl>
                    </>
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={() => handleAssessmentSubmit(assessment.assessment)}
                  borderRadius="lg"
                  leftIcon={<FaRocket />}
                >
                  Start Learning
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAssessmentModal(false);
                    setLoading(false); // Reset loading state when canceling
                  }}
                  borderRadius="lg"
                >
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* User Profile Modal */}
          <Modal
            isOpen={showUserProfileModal}
            onClose={() => setShowUserProfileModal(false)}
            isCentered
          >
            <ModalOverlay />
            <ModalContent borderRadius="xl">
              <ModalHeader bg={modalHeaderBg} borderTopRadius="xl">
                Edit Your Learning Profile
              </ModalHeader>
              <ModalBody pt={6}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Your Name</FormLabel>
                    <Input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Your Age (Optional)</FormLabel>
                    <Input
                      value={userAge}
                      onChange={(e) => setUserAge(e.target.value)}
                      placeholder="Enter your age"
                      type="number"
                      min={5}
                      max={120}
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      This helps us tailor content appropriate for your age group
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Your Interests</FormLabel>
                    <Box>
                      <HStack spacing={2} mt={2} flexWrap="wrap">
                        {userPreferences.map((preference, index) => (
                          <Tag
                            key={index}
                            size="md"
                            borderRadius="full"
                            variant="solid"
                            colorScheme="blue"
                            bg={tagBgColor}
                            color="blue.800"
                            m={1}
                          >
                            <TagLabel>{preference}</TagLabel>
                            <TagCloseButton 
                              onClick={() => 
                                setUserPreferences(userPreferences.filter(p => p !== preference))
                              } 
                            />
                          </Tag>
                        ))}
                      </HStack>
                      
                      <InputGroup size="md" mt={2}>
                        <Input
                          placeholder="Add new interest or topic"
                          id="newPreference"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              if (!userPreferences.includes(e.target.value.trim())) {
                                setUserPreferences([...userPreferences, e.target.value.trim()]);
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <InputRightElement width="4.5rem">
                          <Button
                            h="1.75rem"
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById('newPreference');
                              if (input.value.trim() && !userPreferences.includes(input.value.trim())) {
                                setUserPreferences([...userPreferences, input.value.trim()]);
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                  </FormControl>
                </VStack>
              </ModalBody>
              
              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={() => handleUpdateUserProfile(userName, userAge, userPreferences)}
                  isDisabled={!userName.trim()}
                  borderRadius="lg"
                >
                  Save Changes
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowUserProfileModal(false)}
                  borderRadius="lg"
                >
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      )}
    </ChakraProvider>
  );
}

export default App;
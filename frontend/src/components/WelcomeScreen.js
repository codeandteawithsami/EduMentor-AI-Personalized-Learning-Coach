import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  useColorModeValue,
  Flex,
  SlideFade,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
  Tag,
  TagLabel,
  HStack,
  TagCloseButton,
  InputGroup,
  InputRightElement,
  Tooltip
} from '@chakra-ui/react';
import { FaGraduationCap, FaArrowRight, FaLightbulb, FaBook, FaRocket, FaPlus } from 'react-icons/fa';

export function WelcomeScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [preferenceInput, setPreferenceInput] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isReady, setIsReady] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)');
  const tagBgColor = useColorModeValue('blue.50', 'blue.900');
  const inputBgColor = useColorModeValue("white", "gray.700");
  
  const handleContinue = () => {
    if (currentStep < 3) {
      // Move to next step
      setCurrentStep(currentStep + 1);
    } else if (name.trim()) {
      // Store user data in localStorage
      const userData = {
        name: name.trim(),
        age: age || '',
        preferences: preferences
      };
      
      localStorage.setItem('eduMentor_userData', JSON.stringify(userData));
      localStorage.setItem('eduMentor_userName', name.trim());
      
      setIsReady(true);
      
      // Short delay for animation to complete
      setTimeout(() => {
        onComplete(name.trim(), age, preferences);
      }, 600);
    }
  };
  
  // Handle adding preference tags
  const handleAddPreference = () => {
    if (preferenceInput.trim() !== '' && !preferences.includes(preferenceInput.trim())) {
      setPreferences([...preferences, preferenceInput.trim()]);
      setPreferenceInput('');
    }
  };
  
  // Handle removing preference tags
  const handleRemovePreference = (preference) => {
    setPreferences(preferences.filter(p => p !== preference));
  };
  
  // Handle Enter key in preference input
  const handlePreferenceKeyPress = (e) => {
    if (e.key === 'Enter' && preferenceInput.trim()) {
      e.preventDefault();
      handleAddPreference();
    }
  };
  
  // Handle Enter key in name input
  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter' && name.trim()) {
      e.preventDefault();
      handleContinue();
    }
  };
  
  // Check if current step is valid to proceed
  const isStepValid = () => {
    if (currentStep === 1) return name.trim() !== '';
    if (currentStep === 2) return true; // Age is optional
    if (currentStep === 3) return true; // Preferences are optional but name is required
    return false;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormControl>
            <FormLabel fontWeight="medium">What's your name?</FormLabel>
            <Input
              size="lg"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleNameKeyPress}
              borderRadius="lg"
              focusBorderColor="blue.400"
              bg={inputBgColor}
              borderWidth="2px"
              _hover={{ borderColor: "blue.300" }}
            />
            <Text fontSize="xs" color="gray.500" mt={2}>
              Your name will be used to personalize your learning experience
            </Text>
          </FormControl>
        );
      
      case 2:
        return (
          <FormControl>
            <FormLabel fontWeight="medium">How old are you? (Optional)</FormLabel>
            <NumberInput
              size="lg"
              min={5}
              max={120}
              value={age}
              onChange={(valueString) => setAge(valueString)}
              borderRadius="lg"
              focusBorderColor="blue.400"
            >
              <NumberInputField 
                placeholder="Enter your age"
                bg={inputBgColor}
                borderWidth="2px"
                _hover={{ borderColor: "blue.300" }}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize="xs" color="gray.500" mt={2}>
              This helps us tailor content appropriate for your age group
            </Text>
          </FormControl>
        );
      
      case 3:
        return (
          <FormControl>
            <FormLabel fontWeight="medium">What topics are you interested in? (Optional)</FormLabel>
            <VStack spacing={4} align="stretch">
              <InputGroup size="lg">
                <Input
                  placeholder="e.g., Machine Learning, History, Mathematics"
                  value={preferenceInput}
                  onChange={(e) => setPreferenceInput(e.target.value)}
                  onKeyPress={handlePreferenceKeyPress}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                  bg={inputBgColor}
                  borderWidth="2px"
                  _hover={{ borderColor: "blue.300" }}
                />
                <InputRightElement width="4.5rem">
                  <Tooltip label="Add topic">
                    <Button 
                      h="1.75rem" 
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={handleAddPreference}
                      isDisabled={!preferenceInput.trim()}
                      borderRadius="md"
                    >
                      <FaPlus />
                    </Button>
                  </Tooltip>
                </InputRightElement>
              </InputGroup>
              
              {preferences.length > 0 && (
                <Box>
                  <HStack spacing={2} mt={2} flexWrap="wrap">
                    {preferences.map((preference, index) => (
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
                        <TagCloseButton onClick={() => handleRemovePreference(preference)} />
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              )}
              
              <FormHelperText>
                Add topics you're interested in learning about. Press Enter or click the plus icon to add each topic.
              </FormHelperText>
            </VStack>
          </FormControl>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box
      minH="100vh"
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue("blue.50", "gray.900")}
      backgroundImage="radial-gradient(circle at 25% 25%, rgba(66, 153, 225, 0.1) 0%, transparent 60%),
                       radial-gradient(circle at 75% 75%, rgba(101, 207, 66, 0.08) 0%, transparent 50%)"
      p={4}
    >
      <SlideFade in={!isReady} offsetY="20px">
        <Flex
          direction="column"
          align="center"
          justify="center"
          bg={bgColor}
          p={{ base: 8, md: 12 }}
          borderRadius="2xl"
          boxShadow={`0 10px 30px ${shadowColor}`}
          maxW="500px"
          w="100%"
          borderWidth="1px"
          borderColor={borderColor}
          transition="all 0.3s ease"
          opacity={isReady ? 0 : 1}
          transform={isReady ? 'scale(0.95)' : 'scale(1)'}
        >
          <Flex 
            justifyContent="center" 
            alignItems="center" 
            mb={8}
            p={3}
            bg="blue.50"
            borderRadius="full"
            boxShadow={`0 4px 12px ${shadowColor}`}
          >
            <FaGraduationCap size="3rem" color="#3182CE" />
          </Flex>

          <Heading as="h1" size="xl" textAlign="center" mb={2} color="blue.600">
            Welcome to Leembo.AI
          </Heading>
          <Text fontSize="lg" textAlign="center" mb={6} color="gray.600">
            Your personalized learning assistant
          </Text>
          
          <Flex justify="center" wrap="wrap" gap={4} mb={6}>
            <Flex 
              align="center" 
              bg={useColorModeValue("blue.50", "blue.900")} 
              p={3} 
              borderRadius="lg"
              boxShadow="sm"
            >
              <FaLightbulb style={{ marginRight: '8px', color: '#ECC94B' }} />
              <Text fontSize="sm">Personalized Learning</Text>
            </Flex>
            <Flex 
              align="center" 
              bg={useColorModeValue("green.50", "green.900")} 
              p={3} 
              borderRadius="lg"
              boxShadow="sm"
            >
              <FaBook style={{ marginRight: '8px', color: '#48BB78' }} />
              <Text fontSize="sm">Curated Resources</Text>
            </Flex>
            <Flex 
              align="center" 
              bg={useColorModeValue("purple.50", "purple.900")} 
              p={3} 
              borderRadius="lg"
              boxShadow="sm"
            >
              <FaRocket style={{ marginRight: '8px', color: '#9F7AEA' }} />
              <Text fontSize="sm">Adaptive Learning</Text>
            </Flex>
          </Flex>

          {/* Step indicators */}
          <HStack spacing={2} mb={6}>
            {[1, 2, 3].map((step) => (
              <Box
                key={step}
                w="10px"
                h="10px"
                borderRadius="full"
                bg={currentStep >= step ? "blue.500" : "gray.300"}
                transition="all 0.2s"
              />
            ))}
          </HStack>

          <VStack spacing={6} w="100%">
            {renderStepContent()}

            <Button
              rightIcon={<FaArrowRight />}
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={handleContinue}
              isDisabled={!isStepValid()}
              borderRadius="lg"
              boxShadow="md"
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              {currentStep < 3 ? "Continue" : "Start Your Learning Journey"}
            </Button>
          </VStack>
        </Flex>
      </SlideFade>
    </Box>
  );
}
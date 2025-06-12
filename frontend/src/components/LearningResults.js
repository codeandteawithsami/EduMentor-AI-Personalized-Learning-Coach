import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  Button,
  Badge,
  HStack,
  useColorModeValue,
  Flex,
  Icon,
  Tag,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { PersonalizedLearningHeader } from './PersonalizedLearningHeader';
import { FaBirthdayCake, FaBook, FaLightbulb } from 'react-icons/fa';

export function LearningResults({ 
  results, 
  onReset, 
  userName, 
  userAge = '', 
  userPreferences = [] 
}) {
  const [quizState, setQuizState] = useState({
    answers: {},
    lockedAnswers: new Set(),
    showResults: false,
    score: null
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const preferenceHighlightBg = useColorModeValue('yellow.50', 'yellow.900');
  const preferenceHighlightBorder = useColorModeValue('yellow.200', 'yellow.700');

  // Reset quiz state completely when results change (new topic)
  useEffect(() => {
    setQuizState({
      answers: {},
      lockedAnswers: new Set(),
      showResults: false,
      score: null
    });
  }, [results]);

  const handleAnswerSelect = (questionIndex, value) => {
    // If answer is already locked, don't allow changes
    if (quizState.lockedAnswers.has(questionIndex)) {
      return;
    }

    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: value
      },
      // Lock this answer immediately after selection
      lockedAnswers: new Set([...prev.lockedAnswers, questionIndex])
    }));
  };

  const handleCheckAnswers = () => {
    const totalQuestions = results.quiz.length;
    const correctAnswers = results.quiz.reduce((count, question, index) => {
      return count + (quizState.answers[index] === String(question.correct_answer) ? 1 : 0);
    }, 0);
    
    setQuizState(prev => ({
      ...prev,
      showResults: true,
      score: (correctAnswers / totalQuestions) * 100
    }));
  };

  const handleStartNewTopic = () => {
    setQuizState({
      answers: {},
      lockedAnswers: new Set(),
      showResults: false,
      score: null
    });
    onReset();
  };

  // Function to get Age Display
  const getAgeDisplay = () => {
    if (!userAge) return "Not specified";
    
    const age = parseInt(userAge);
    if (age < 13) return `${userAge} (Elementary)`;
    if (age < 18) return `${userAge} (Teen)`;
    return userAge;
  };

  // Function to highlight preferences in the explanation
  const highlightPreferences = (explanation) => {
    if (!userPreferences || userPreferences.length === 0 || !explanation) {
      return explanation;
    }

    let highlightedText = explanation;
    
    // Create a simple regex matcher for each preference
    userPreferences.forEach(pref => {
      // Use a regex that finds the preference with word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${pref}\\b`, 'gi');
      
      // We need to be careful with markdown/HTML conflicts, so we'll use a simple approach
      // This might not work perfectly in all cases but is a reasonable start
      highlightedText = highlightedText.replace(regex, `**${pref}**`);
    });
    
    return highlightedText;
  };

  // Find relevant user preferences for this topic
  const findRelevantPreferences = () => {
    if (!userPreferences || userPreferences.length === 0 || !results.topic) {
      return [];
    }
    
    const topicLower = results.topic.toLowerCase();
    return userPreferences.filter(pref => {
      const prefLower = pref.toLowerCase();
      
      // Check if preference is related to the topic
      return topicLower.includes(prefLower) || 
             prefLower.includes(topicLower) ||
             // Check for partial word matches (better NLP would be ideal here)
             topicLower.split(' ').some(word => prefLower.includes(word) || 
                                             prefLower.split(' ').some(prefWord => word.includes(prefWord)));
    });
  };

  const relevantPreferences = findRelevantPreferences();

  return (
    <VStack spacing={6} align="stretch">
      {/* Personalized Header */}
      <PersonalizedLearningHeader 
        topic={results.topic} 
        userName={userName} 
        assessment={results.assessment} 
        userAge={userAge}
        userPreferences={userPreferences}
      />

      {/* Assessment Results */}
      <Box 
        bg={cardBg} 
        p={6} 
        borderRadius="lg" 
        shadow="base"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <HStack justify="space-between" align="center" mb={4}>
          <Heading size="md">📊 Your Learning Profile</Heading>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleStartNewTopic}
            borderRadius="md"
          >
            Start New Topic
          </Button>
        </HStack>
        <HStack spacing={3} flexWrap="wrap">
          <Badge colorScheme="blue" mr={2} p={1} borderRadius="md">
            Level: {results.assessment.level}
          </Badge>
          <Badge colorScheme="green" p={1} borderRadius="md">
            Learning Style: {results.assessment.style}
          </Badge>
          
          {userAge && (
            <Badge colorScheme="purple" p={1} borderRadius="md">
              <Flex align="center">
                <Icon as={FaBirthdayCake} mr={1} />
                <Text>{getAgeDisplay()}</Text>
              </Flex>
            </Badge>
          )}
        </HStack>
        
        {/* Related interests section */}
        {relevantPreferences.length > 0 && (
          <Box 
            mt={4} 
            p={3} 
            bg={preferenceHighlightBg} 
            borderRadius="md"
            borderWidth="1px"
            borderColor={preferenceHighlightBorder}
          >
            <Flex align="center" mb={2}>
              <Icon as={FaLightbulb} color="yellow.500" mr={2} />
              <Text fontWeight="medium">Related to your interests</Text>
            </Flex>
            <Flex gap={2} flexWrap="wrap">
              {relevantPreferences.map((pref, idx) => (
                <Tag key={idx} colorScheme="yellow" size="sm">
                  {pref}
                </Tag>
              ))}
            </Flex>
          </Box>
        )}
      </Box>

      {/* Curated Resources */}
      <Box 
        bg={cardBg} 
        p={6} 
        borderRadius="lg" 
        shadow="base"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4}>
          🔍 Curated Resources
        </Heading>
        {results.resources.length > 0 ? (
          <List spacing={3}>
            {results.resources.map((resource, index) => (
              <ListItem key={index}>
                <Link href={resource.url} color="blue.500" isExternal>
                  {resource.title}
                </Link>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {resource.summary}
                </Text>
              </ListItem>
            ))}
          </List>
        ) : (
          <Text color="gray.500">No resources available for this topic.</Text>
        )}
      </Box>

      {/* Explanation */}
      <Box 
        bg={cardBg} 
        p={6} 
        borderRadius="lg" 
        shadow="base"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4}>
          🧠 Explanation
        </Heading>
        <Box className="markdown-content">
          <ReactMarkdown>{highlightPreferences(results.explanation)}</ReactMarkdown>
        </Box>
      </Box>

      {/* Quiz */}
      {results.quiz.length > 0 && (
        <Box 
          bg={cardBg} 
          p={6} 
          borderRadius="lg" 
          shadow="base"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Heading size="md" mb={4}>
            🧪 Knowledge Check
          </Heading>
          {quizState.score !== null && (
            <Box 
              mb={4} 
              p={3} 
              bg={quizState.score >= 70 ? "green.50" : "yellow.50"} 
              borderRadius="md"
              borderWidth="1px"
              borderColor={quizState.score >= 70 ? "green.200" : "yellow.200"}
            >
              <Text fontWeight="bold" color={quizState.score >= 70 ? "green.600" : "yellow.600"}>
                Your Score: {quizState.score.toFixed(0)}%
              </Text>
              <Text fontSize="sm" mt={1}>
                {quizState.score >= 70 
                  ? `Great job, ${userName}! You've mastered this material.` 
                  : `Don't worry, ${userName}. Learning takes time - review the material and try again!`}
              </Text>
            </Box>
          )}
          <Accordion allowMultiple defaultIndex={[0]}>
            {results.quiz.map((question, qIndex) => (
              <AccordionItem key={qIndex}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Question {qIndex + 1}
                      {quizState.lockedAnswers.has(qIndex) && !quizState.showResults && (
                        <Badge ml={2} colorScheme="blue">Answered</Badge>
                      )}
                      {quizState.showResults && (
                        <Badge ml={2} colorScheme={
                          quizState.answers[qIndex] === String(question.correct_answer)
                            ? "green"
                            : "red"
                        }>
                          {quizState.answers[qIndex] === String(question.correct_answer)
                            ? "Correct"
                            : "Incorrect"}
                        </Badge>
                      )}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={4}>
                    <Text fontWeight="medium">{question.question}</Text>
                    <RadioGroup
                      onChange={(value) => handleAnswerSelect(qIndex, value)}
                      value={quizState.answers[qIndex]}
                      isDisabled={quizState.lockedAnswers.has(qIndex)}
                    >
                      <Stack direction="column">
                        {question.options.map((option, oIndex) => (
                          <Radio key={oIndex} value={String(oIndex)}>
                            {option}
                          </Radio>
                        ))}
                      </Stack>
                    </RadioGroup>
                    {quizState.showResults && (
                      <Text
                        color={
                          quizState.answers[qIndex] === String(question.correct_answer)
                            ? 'green.500'
                            : 'red.500'
                        }
                        fontWeight="medium"
                      >
                        {quizState.answers[qIndex] === String(question.correct_answer)
                          ? '✅ Correct!'
                          : `❌ Incorrect. The correct answer is: ${
                              question.options[question.correct_answer]
                            }`}
                      </Text>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <Button
            mt={4}
            colorScheme="blue"
            onClick={handleCheckAnswers}
            isDisabled={
              quizState.showResults ||
              Object.keys(quizState.answers).length !== results.quiz.length
            }
            borderRadius="md"
          >
            Check Answers
          </Button>
        </Box>
      )}
    </VStack>
  );
}
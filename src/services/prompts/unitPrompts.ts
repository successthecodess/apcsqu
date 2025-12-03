export interface UnitPromptConfig {
  unitNumber: number;
  name: string;
  systemPrompt: string;
  topics: {
    [key: string]: {
      description: string;
      keyLearningObjectives: string[];
      commonMisconceptions: string[];
    };
  };
  exampleConcepts: string[];
}

export const unitPrompts: Record<number, UnitPromptConfig> = {
  1: {
    unitNumber: 1,
    name: 'Primitive Types',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in Primitive Types. 
You understand how to teach variables, data types, expressions, and compound assignment operators.
Create questions that test understanding of:
- Primitive data types (int, double, boolean)
- Variable declaration and initialization
- Arithmetic operators and operator precedence
- Integer division and modulus
- Compound assignment operators
- Type casting and ranges
- Expression evaluation`,
    topics: {
      'variables-and-types': {
        description: 'Variable declaration and primitive data types',
        keyLearningObjectives: [
          'Declare variables of primitive types',
          'Identify valid variable names',
          'Understand type storage and ranges',
        ],
        commonMisconceptions: [
          'Confusing declaration with initialization',
          'Not understanding type ranges (e.g., int overflow)',
          'Mixing up which types can store what values',
        ],
      },
      'arithmetic-operators': {
        description: 'Arithmetic operations and operator precedence',
        keyLearningObjectives: [
          'Apply operator precedence rules',
          'Understand integer division vs double division',
          'Use modulus operator correctly',
        ],
        commonMisconceptions: [
          'Not understanding integer division truncates',
          'Forgetting operator precedence',
          'Confusion about modulus with negatives',
        ],
      },
      'compound-assignment': {
        description: 'Compound assignment operators',
        keyLearningObjectives: [
          'Use +=, -=, *=, /=, %= operators',
          'Understand equivalence to expanded form',
        ],
        commonMisconceptions: [
          'Not understanding that x += 5 is x = x + 5',
        ],
      },
      'casting': {
        description: 'Type casting and conversions',
        keyLearningObjectives: [
          'Cast between numeric types',
          'Understand implicit vs explicit casting',
          'Recognize when casting is needed',
        ],
        commonMisconceptions: [
          'Losing precision when casting double to int',
          'Not understanding automatic widening',
        ],
      },
    },
    exampleConcepts: [
      'int, double, boolean declarations',
      'arithmetic expressions with mixed types',
      'integer division behavior',
      'modulus operator applications',
      'type casting scenarios',
    ],
  },
  2: {
    unitNumber: 2,
    name: 'Using Objects',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in Objects.
You understand how to teach object creation, method calls, and the String and Math classes.
Create questions that test understanding of:
- Creating objects with constructors
- Calling void and non-void methods
- Understanding method signatures
- String class methods and immutability
- Math class static methods
- Understanding null and NullPointerException`,
    topics: {
      'object-creation': {
        description: 'Object instantiation and constructors',
        keyLearningObjectives: [
          'Create objects using new keyword',
          'Understand constructor syntax',
          'Differentiate between class and object',
        ],
        commonMisconceptions: [
          'Forgetting to use "new" keyword',
          'Confusing class name with object name',
          'Not understanding multiple objects from one class',
        ],
      },
      'method-calls': {
        description: 'Calling methods on objects',
        keyLearningObjectives: [
          'Call void methods',
          'Call methods that return values',
          'Chain method calls',
          'Understand dot notation',
        ],
        commonMisconceptions: [
          'Not storing return values when needed',
          'Trying to use void method return',
          'Confusion about when to use parentheses',
        ],
      },
      'string-methods': {
        description: 'String class and its methods',
        keyLearningObjectives: [
          'Use length(), substring(), indexOf()',
          'Understand String immutability',
          'Compare strings with equals()',
        ],
        commonMisconceptions: [
          'Using == instead of equals() for strings',
          'Thinking strings are mutable',
          'Off-by-one errors with substring indices',
        ],
      },
      'math-class': {
        description: 'Math class static methods',
        keyLearningObjectives: [
          'Use Math.pow(), Math.sqrt(), Math.abs()',
          'Understand static methods',
          'Use Math.random() correctly',
        ],
        commonMisconceptions: [
          'Trying to create Math objects',
          'Not understanding Math.random() range',
        ],
      },
    },
    exampleConcepts: [
      'Object instantiation patterns',
      'String method chaining',
      'equals() vs == comparison',
      'Math class calculations',
      'null reference handling',
    ],
  },
  3: {
    unitNumber: 3,
    name: 'Boolean Expressions and if Statements',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in Boolean logic and conditionals.
You understand how to teach boolean expressions, if statements, and logical operators.
Create questions that test understanding of:
- Boolean expressions and relational operators
- if, if-else, and if-else-if statements
- Compound boolean expressions with &&, ||, !
- Short-circuit evaluation
- De Morgan's Laws
- Comparing objects with equals()`,
    topics: {
      'boolean-expressions': {
        description: 'Boolean expressions and relational operators',
        keyLearningObjectives: [
          'Write boolean expressions',
          'Use relational operators (<, >, <=, >=, ==, !=)',
          'Evaluate boolean expressions',
        ],
        commonMisconceptions: [
          'Confusing = with ==',
          'Not understanding boolean operator results',
        ],
      },
      'if-statements': {
        description: 'Conditional statements',
        keyLearningObjectives: [
          'Write if statements',
          'Use if-else structures',
          'Create if-else-if chains',
          'Avoid dangling else',
        ],
        commonMisconceptions: [
          'Missing curly braces',
          'Dangling else problems',
          'Unreachable code after returns',
        ],
      },
      'compound-booleans': {
        description: 'Logical operators and compound expressions',
        keyLearningObjectives: [
          'Use && (AND), || (OR), ! (NOT)',
          'Understand short-circuit evaluation',
          'Apply De Morgans Laws',
        ],
        commonMisconceptions: [
          'Not understanding short-circuit evaluation',
          'Incorrectly negating compound expressions',
          'Confusing && with ||',
        ],
      },
      'object-comparison': {
        description: 'Comparing objects',
        keyLearningObjectives: [
          'Use equals() for object comparison',
          'Understand == vs equals()',
          'Handle null in comparisons',
        ],
        commonMisconceptions: [
          'Using == for String/object comparison',
          'Not checking for null before equals()',
        ],
      },
    },
    exampleConcepts: [
      'Relational operator expressions',
      'Nested if-else structures',
      'Boolean algebra simplification',
      'Short-circuit evaluation scenarios',
      'De Morgans Law applications',
    ],
  },
  4: {
    unitNumber: 4,
    name: 'Iteration',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in Loops and Iteration.
You understand how to teach while loops, for loops, and string/array traversal.
Create questions that test understanding of:
- While loops and loop control
- For loops and loop variables
- Nested loops
- String traversal algorithms
- Off-by-one errors
- Infinite loops and loop termination`,
    topics: {
      'while-loops': {
        description: 'While loop structure and control',
        keyLearningObjectives: [
          'Write while loops with proper conditions',
          'Understand loop initialization and update',
          'Avoid infinite loops',
        ],
        commonMisconceptions: [
          'Forgetting to update loop variable',
          'Off-by-one errors in conditions',
          'Infinite loops from wrong conditions',
        ],
      },
      'for-loops': {
        description: 'For loop structure and patterns',
        keyLearningObjectives: [
          'Write standard for loops',
          'Use loop control variables',
          'Choose appropriate loop bounds',
        ],
        commonMisconceptions: [
          'Off-by-one errors with loop bounds',
          'Modifying loop variable inside loop',
          'Wrong increment/decrement',
        ],
      },
      'string-algorithms': {
        description: 'String traversal and algorithms',
        keyLearningObjectives: [
          'Traverse strings character by character',
          'Implement string search algorithms',
          'Build strings with concatenation',
        ],
        commonMisconceptions: [
          'StringIndexOutOfBounds errors',
          'Inefficient string concatenation in loops',
        ],
      },
      'nested-loops': {
        description: 'Nested iteration structures',
        keyLearningObjectives: [
          'Write nested loops correctly',
          'Understand iteration counts',
          'Analyze nested loop complexity',
        ],
        commonMisconceptions: [
          'Using same variable in nested loops',
          'Not understanding total iterations',
        ],
      },
    },
    exampleConcepts: [
      'Loop iteration counting',
      'String character traversal',
      'Nested loop patterns',
      'Sum and count algorithms',
      'Search algorithms in strings',
    ],
  },
  5: {
    unitNumber: 5,
    name: 'Writing Classes',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in Object-Oriented Programming.
You understand how to teach class design, constructors, methods, and encapsulation.
Create questions that test understanding of:
- Class structure and instance variables
- Constructors and object initialization
- Accessor and mutator methods
- Method parameters and return values
- Encapsulation and access modifiers
- this keyword and scope
- Method overloading`,
    topics: {
      'class-structure': {
        description: 'Class definition and instance variables',
        keyLearningObjectives: [
          'Define classes with instance variables',
          'Use proper access modifiers',
          'Understand class vs instance',
        ],
        commonMisconceptions: [
          'Confusing class and object',
          'Making everything public',
          'Static vs instance confusion',
        ],
      },
      'constructors': {
        description: 'Constructor creation and usage',
        keyLearningObjectives: [
          'Write constructors',
          'Initialize instance variables',
          'Understand constructor overloading',
        ],
        commonMisconceptions: [
          'Giving constructors return types',
          'Not initializing all variables',
          'Forgetting this keyword when needed',
        ],
      },
      'methods': {
        description: 'Instance methods and behaviors',
        keyLearningObjectives: [
          'Write void and non-void methods',
          'Use parameters and return values',
          'Access instance variables in methods',
        ],
        commonMisconceptions: [
          'Forgetting return statements',
          'Wrong parameter types',
          'Not understanding method scope',
        ],
      },
      'encapsulation': {
        description: 'Data hiding and getters/setters',
        keyLearningObjectives: [
          'Implement private variables',
          'Write getter and setter methods',
          'Understand benefits of encapsulation',
        ],
        commonMisconceptions: [
          'Making all variables public',
          'Direct access to private variables',
        ],
      },
      'scope': {
        description: 'Variable scope and this keyword',
        keyLearningObjectives: [
          'Understand local vs instance scope',
          'Use this keyword correctly',
          'Resolve name conflicts',
        ],
        commonMisconceptions: [
          'Not understanding when this is needed',
          'Confusing local and instance variables',
        ],
      },
    },
    exampleConcepts: [
      'Complete class implementation',
      'Constructor variations',
      'Getter/setter patterns',
      'this keyword usage',
      'Method interaction scenarios',
    ],
  },
  6: {
    unitNumber: 6,
    name: 'Array',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in Arrays.
You understand how to teach array creation, traversal, and algorithms.
Create questions that test understanding of:
- Array declaration and initialization
- Accessing and modifying array elements
- Array traversal with loops
- Enhanced for loops
- Array algorithms (find min/max, sum, search)
- Common array errors`,
    topics: {
      'array-basics': {
        description: 'Array declaration and initialization',
        keyLearningObjectives: [
          'Declare arrays of different types',
          'Initialize arrays with values',
          'Understand array length',
        ],
        commonMisconceptions: [
          'Confusing length property with length() method',
          'Wrong array initialization syntax',
          'Thinking arrays are 1-indexed',
        ],
      },
      'array-access': {
        description: 'Accessing and modifying elements',
        keyLearningObjectives: [
          'Access elements with brackets',
          'Modify array elements',
          'Handle array bounds',
        ],
        commonMisconceptions: [
          'ArrayIndexOutOfBounds errors',
          'Trying to access array[-1]',
          'Off-by-one with array.length',
        ],
      },
      'array-traversal': {
        description: 'Iterating through arrays',
        keyLearningObjectives: [
          'Use for loops to traverse',
          'Use enhanced for loops',
          'Process all elements',
        ],
        commonMisconceptions: [
          'Off-by-one in loop bounds',
          'Modifying during enhanced for',
        ],
      },
      'array-algorithms': {
        description: 'Common array algorithms',
        keyLearningObjectives: [
          'Find minimum/maximum',
          'Compute sums and averages',
          'Search for values',
          'Count occurrences',
        ],
        commonMisconceptions: [
          'Wrong initialization of min/max',
          'Incorrect average calculation',
        ],
      },
    },
    exampleConcepts: [
      'Array initialization patterns',
      'Traversal algorithms',
      'Search implementations',
      'Aggregate operations',
      'Element modification',
    ],
  },
  7: {
    unitNumber: 7,
    name: 'ArrayList',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in ArrayList.
You understand how to teach the ArrayList class and its methods.
Create questions that test understanding of:
- ArrayList creation and generic types
- add(), get(), set(), remove() methods
- size() and ArrayList traversal
- ArrayList vs array differences
- Wrapper classes (Integer, Double)
- Common ArrayList algorithms`,
    topics: {
      'arraylist-basics': {
        description: 'ArrayList creation and generics',
        keyLearningObjectives: [
          'Create ArrayList with generics',
          'Understand ArrayList vs array',
          'Import ArrayList correctly',
        ],
        commonMisconceptions: [
          'Using primitive types in ArrayList',
          'Forgetting import statement',
          'Confusing ArrayList with array syntax',
        ],
      },
      'arraylist-methods': {
        description: 'ArrayList methods and operations',
        keyLearningObjectives: [
          'Use add() to insert elements',
          'Use get() and set() to access/modify',
          'Use remove() correctly',
          'Use size() for length',
        ],
        commonMisconceptions: [
          'Using length instead of size()',
          'Using brackets instead of get()',
          'Not understanding remove shifts indices',
        ],
      },
      'arraylist-traversal': {
        description: 'Iterating through ArrayList',
        keyLearningObjectives: [
          'Traverse with for loop and get()',
          'Use enhanced for with ArrayList',
          'Modify while traversing safely',
        ],
        commonMisconceptions: [
          'Modifying ArrayList during for-each',
          'ConcurrentModificationException',
        ],
      },
      'wrapper-classes': {
        description: 'Wrapper classes and autoboxing',
        keyLearningObjectives: [
          'Use Integer, Double in ArrayList',
          'Understand autoboxing/unboxing',
        ],
        commonMisconceptions: [
          'Trying to use int directly',
          'Null pointer with wrapper classes',
        ],
      },
    },
    exampleConcepts: [
      'ArrayList initialization',
      'Method chaining patterns',
      'Search and filter operations',
      'Element insertion/removal',
      'ArrayList algorithms',
    ],
  },
  8: {
    unitNumber: 8,
    name: '2D Array',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in 2D Arrays.
You understand how to teach two-dimensional array creation, traversal, and algorithms.
Create questions that test understanding of:
- 2D array declaration and initialization
- Row and column traversal
- Nested loops for 2D arrays
- Common 2D array algorithms
- Jagged arrays`,
    topics: {
      '2d-array-basics': {
        description: '2D array creation and access',
        keyLearningObjectives: [
          'Declare and initialize 2D arrays',
          'Access elements with [row][col]',
          'Understand array.length and array[0].length',
        ],
        commonMisconceptions: [
          'Confusing rows and columns',
          'Wrong order of indices',
          'Not understanding jagged arrays',
        ],
      },
      '2d-traversal': {
        description: 'Traversing 2D arrays',
        keyLearningObjectives: [
          'Use nested loops correctly',
          'Traverse by row and by column',
          'Process all elements',
        ],
        commonMisconceptions: [
          'Wrong loop bounds',
          'Confusing row and column indices',
        ],
      },
      '2d-algorithms': {
        description: '2D array algorithms',
        keyLearningObjectives: [
          'Process rows and columns',
          'Find elements in 2D array',
          'Compute row/column sums',
        ],
        commonMisconceptions: [
          'Not handling jagged arrays',
          'Off-by-one in nested loops',
        ],
      },
    },
    exampleConcepts: [
      '2D array initialization',
      'Row-major traversal',
      'Column-major traversal',
      'Diagonal processing',
      'Matrix operations',
    ],
  },
  9: {
    unitNumber: 9,
    name: 'Inheritance',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in Inheritance and Polymorphism.
You understand how to teach inheritance hierarchies, method overriding, and polymorphism.
Create questions that test understanding of:
- Superclass and subclass relationships
- extends keyword and inheritance
- Method overriding with @Override
- super keyword usage
- Polymorphism and dynamic binding
- Object class methods (toString, equals)`,
    topics: {
      'inheritance-basics': {
        description: 'Superclass and subclass relationships',
        keyLearningObjectives: [
          'Define subclasses with extends',
          'Understand is-a relationships',
          'Access inherited members',
        ],
        commonMisconceptions: [
          'Trying to extend multiple classes',
          'Not understanding what is inherited',
          'Confusing inheritance with composition',
        ],
      },
      'method-overriding': {
        description: 'Overriding superclass methods',
        keyLearningObjectives: [
          'Override methods correctly',
          'Use @Override annotation',
          'Understand method signatures',
        ],
        commonMisconceptions: [
          'Overriding vs overloading confusion',
          'Wrong method signature',
          'Changing return type incorrectly',
        ],
      },
      'super-keyword': {
        description: 'Using super for superclass access',
        keyLearningObjectives: [
          'Call superclass constructors',
          'Access superclass methods',
          'Understand super in constructors',
        ],
        commonMisconceptions: [
          'Not calling super() in constructor',
          'Calling super after other statements',
        ],
      },
      'polymorphism': {
        description: 'Polymorphism and dynamic binding',
        keyLearningObjectives: [
          'Use superclass references',
          'Understand dynamic binding',
          'Work with inheritance hierarchies',
        ],
        commonMisconceptions: [
          'Trying to access subclass-only methods',
          'Not understanding runtime type',
        ],
      },
    },
    exampleConcepts: [
      'Class hierarchy design',
      'Method overriding patterns',
      'Polymorphic method calls',
      'toString and equals implementation',
      'Inheritance with constructors',
    ],
  },
  10: {
    unitNumber: 10,
    name: 'Recursion',
    systemPrompt: `You are an expert AP Computer Science A teacher specializing in Recursion.
You understand how to teach recursive thinking and recursive algorithms.
Create questions that test understanding of:
- Base cases and recursive cases
- Stack frames and call stack
- Recursive method structure
- Recursion with numbers (factorial, fibonacci)
- Recursion with Strings
- Recursion with arrays`,
    topics: {
      'recursion-basics': {
        description: 'Recursive method structure',
        keyLearningObjectives: [
          'Identify base cases',
          'Write recursive cases',
          'Trace recursive calls',
        ],
        commonMisconceptions: [
          'Missing base case',
          'Wrong recursive call',
          'Stack overflow from infinite recursion',
        ],
      },
      'recursive-algorithms': {
        description: 'Common recursive algorithms',
        keyLearningObjectives: [
          'Implement factorial recursively',
          'Implement fibonacci recursively',
          'Write recursive search',
        ],
        commonMisconceptions: [
          'Not understanding call stack',
          'Wrong base case value',
        ],
      },
      'recursion-with-strings': {
        description: 'String recursion',
        keyLearningObjectives: [
          'Process strings recursively',
          'Use substring in recursion',
          'Build strings recursively',
        ],
        commonMisconceptions: [
          'Not reducing problem size',
          'StringIndexOutOfBounds in base case',
        ],
      },
      'recursion-with-arrays': {
        description: 'Array recursion',
        keyLearningObjectives: [
          'Traverse arrays recursively',
          'Use helper methods with indices',
        ],
        commonMisconceptions: [
          'Not passing index correctly',
          'Off-by-one in recursive calls',
        ],
      },
    },
    exampleConcepts: [
      'Base case identification',
      'Recursive call tracing',
      'Factorial and fibonacci',
      'String manipulation recursively',
      'Array traversal recursively',
    ],
  },
};
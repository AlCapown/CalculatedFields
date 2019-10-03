$(document).ready(function() {
    var shared = {};

    shared.init = function() {
        let a = shared.calculate("3 + 4 * 2 / (( 1 - 5 ) ^ 2) ^ 3");
        console.log(a);
        let b = shared.calculate("2 / 0.5 * (6000 - 4000 / 40) ^ 2");
        console.log(b);

        $('#calc').on("click", shared.onClick);
    };

    shared.calculate = function(expression) {
        // Use Shunting-yard algorithm to transform infix expression to postfix notation.
        // This will remove the need for parenthesis when evaluation the expression
        const calc = function(expression) {
            try {
                let expr = splitExpression(expression);
                expr = lookupValues(expr);
                expr = infixToPostfix(expr);
                return evaluatePostfixExpression(expr);
            }
            catch(err) {
                return NaN;
            }
        };

        // Split expression string into an array of operators, operands, and parenthesis
        // keeping the order that they appear.
        // For Example: "#c * (#a + #b)" -> ['#c', '*', '(', '#a', '+', '#b', ')']
        const splitExpression = function(expr) {
            let array = [];
            let i = 0;
            let token = '';
            const splitValues = ['^', '*', '/', '+', '-', '(', ')'];
            while (i < expr.length) {
                let exists = splitValues.includes(expr.charAt(i));
                if(exists && token.trim() !== '') {
                    array.push(token.trim());
                    token = '';
                }
                token += expr.charAt(i);
                if (exists) {
                    array.push(token.trim());
                    token = '';
                }
                i++;
            }
            if(token.trim() !== '') {
                array.push(token.trim());
            }
            return array;
        };

        
        const lookupValues = function(array) {
            let i = 0;
            while(i < array.length) {
                if(array[i].charAt(0) === '#') {
                    let inputId = $(array[i]);
                    if(inputId.length > 0 && $.isNumeric(inputId.val())) {
                        array[i] = inputId.val();
                    }
                    else {
                        array[i] = 0;
                    }
                }
                i++;
            }
            return array;
        };

        // Shunting-yard algorithm
        // https://en.wikipedia.org/wiki/Shunting-yard_algorithm
        const infixToPostfix = function(tokens) {
            let outputQueue = [];
            let operatorStack = [];

            while(tokens.length > 0) {
                let token = tokens.shift();
                if($.isNumeric(token)) {
                    outputQueue.push(token);
                }
                else if (token in operators) {
                    while(loop(token, operatorStack[operatorStack.length-1])) {
                        outputQueue.push(operatorStack.pop());
                    }
                    operatorStack.push(token);
                }
                else if (token === '(') {
                    operatorStack.push(token);
                }
                else if (token === ')') {
                    while(operatorStack[operatorStack.length-1] !== '(') {
                        outputQueue.push(operatorStack.pop()); 
                    }
                    if(operatorStack[operatorStack.length-1] === '(') {
                        operatorStack.pop();
                    }
                }
            }

            while(operatorStack.length > 0) {
                outputQueue.push(operatorStack.pop());  
            }

            return outputQueue;
        };

        // Returns true if:
        // (the operator at the top of the operator stack is not a left parenthesis) AND
        // ((there is an operator at the top of the operator stack with greater precedence) OR
        //  (the operator at the top of the operator stack has equal precedence and is left associative)) 
        const loop = function(token, topStack) {
            if(topStack === null || topStack === undefined)
                return false;

            let tokenInfo = operators[token];
            let topStackInfo = operators[topStack];

            if(topStack !== '(' &&
               (topStackInfo.precedence > tokenInfo.precedence ||
               (topStackInfo.precedence === tokenInfo.precedence && topStackInfo.associativity === 'left'))) {
                return true;
            }

            return false;
        };

        const evaluatePostfixExpression = function(queue) {
            let stack = [];
            while(queue.length > 0) {
                let token = queue.shift();
                if($.isNumeric(token)) {
                    stack.push(token);
                }
                else {
                    let a = parseFloat(stack.pop());
                    let b = parseFloat(stack.pop());
                    switch(token) {
                        case '^':
                            stack.push(Math.pow(b, a));
                            break;
                        case '*':
                            stack.push(b * a)
                            break;
                        case '/':
                            if(a === 0) throw "divide by zero";
                            stack.push(b / a);
                            break;
                        case '+':
                            stack.push(b + a);
                            break;
                        case '-':
                            stack.push(b - a);
                            break;
                    }
                }
            }
            return stack.pop();
        };

        const operators = {
            '^': { precedence: 4, associativity: 'right' },
            '*': { precedence: 3, associativity: 'left'  },
            '/': { precedence: 3, associativity: 'left'  },
            '+': { precedence: 2, associativity: 'left'  },
            '-': { precedence: 2, associativity: 'left'  }};

        return calc(expression);
    };

    shared.onClick = function() {
        let answer = shared.calculate("10+#a+(#b-#c)*#d");
        console.log(answer);
        $('#value').val(answer);
    }

    shared.init();
});
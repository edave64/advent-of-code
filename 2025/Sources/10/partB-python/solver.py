import pulp

def solve_system(equations: list[tuple[list[int], int]]) -> list[int]:
    num_vars = len(equations[0][0])

    # Define problem
    prob = pulp.LpProblem("IntegerEquationSystem", pulp.LpMinimize)

    # Variables: positive integers
    variables = [pulp.LpVariable(f"x{i}", lowBound=0, cat="Integer")
         for i in range(num_vars)]

    # Objective: minimize sum of variables
    # This needs to be the first thing added to the problem
    prob += pulp.lpSum(variables)

    # Constraints
    for factors, result in equations:
        prob += pulp.lpSum(factors[i] * variables[i] for i in range(num_vars)) == result

    # Solve with the integrated solver
    status = prob.solve(pulp.PULP_CBC_CMD(msg=False))

    if pulp.LpStatus[status] != "Optimal":
        raise Exception("No solution found")

    return [int(v.value()) for v in variables]

# `sum` is taken by a global function
sum_ = 0

with open('../../../Data/input10.txt') as f:
    for line in f:
        parts = line.strip().split(' ')
        buttons: list[list[int]] = []
        target = None

        for part in parts:
            if part[0] == "(":
                buttons.append([ int(numeric_string) for numeric_string in part[1:-1].split(',') ])
            elif part[0] == "{":
                target = [ int(numeric_string) for numeric_string in part[1:-1].split(',') ]

        equations = []

        for i in range(len(target)):
            equations.append(([1 if i in button else 0 for button in buttons], target[i]))
        
        r = solve_system(equations)
        print(' '.join([str(result) for result in r]))
        ret = sum(r)


        sum_ += ret

print(sum_)

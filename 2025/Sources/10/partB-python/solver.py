import pulp

def solve_system(equations, num_vars):
    """
    equations: list of (coeffs, rhs)
        coeffs = list of length num_vars
        rhs = integer
    num_vars: number of variables
    """

    # Define problem
    prob = pulp.LpProblem("IntegerEquationSystem", pulp.LpMinimize)

    # Variables: positive integers
    x = [pulp.LpVariable(f"x{i}", lowBound=0, cat="Integer")
         for i in range(num_vars)]

    # Objective: minimize sum of variables
    prob += pulp.lpSum(x)

    # Constraints
    for coeffs, rhs in equations:
        prob += pulp.lpSum(coeffs[i] * x[i] for i in range(num_vars)) == rhs

    # Solve
    status = prob.solve(pulp.PULP_CBC_CMD(msg=False))

    if pulp.LpStatus[status] != "Optimal":
        return None

    return [int(v.value()) for v in x]

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
        
        r = solve_system(equations, len(buttons))
        print(' '.join([str(result) for result in r]))
        ret = sum(r)


        sum_ += ret

print(sum_)

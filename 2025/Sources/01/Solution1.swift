struct Solution1 : Solution {
  func partA(input: String) throws -> String {
    let inputs = input.split(separator: "\n")
    var dial = 50
    var res = 0

    for input in inputs {
      let dir = input.first!
      let dist = Int(input.dropFirst())!

      switch dir {
      case "L":
        dial = dial - dist
      case "R":
        dial = dial + dist
      default:
        throw SolutionError.invalidDirection
      }

      dial = iMod(dial, 100)

      if dial == 0 {
        res += 1
      }
    }

    return String(res)
  }

  func partB(input: String) throws -> String {
    let inputs = input.split(separator: "\n")
    var dial = 50
    var res = 0

    for input in inputs {
      let dir = input.first!
      let dist = Int(input.dropFirst())!

      var wasZero = dial == 0

      switch dir {
      case "L":
        dial = dial - dist
      case "R":
        dial = dial + dist
      default:
        throw SolutionError.invalidDirection
      }

      if dial == 0 {
        res += 1
      } else if dial < 0 {
        while dial < 0 {
            dial += 100
            if !wasZero {
                res += 1
            }
            wasZero = false
        }
        if dial == 0 {
            res += 1
        }
      } else {
        while dial >= 100 {
            dial -= 100
            res += 1
        }
      }
    }

    return String(res)
  }

  func iMod(_ a: Int, _ b: Int) -> Int {
    return (a % b + b) % b
  }
}

enum SolutionError: Error {
    case invalidDirection
}

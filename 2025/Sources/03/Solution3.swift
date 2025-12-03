import Foundation

struct Solution3 : Solution {
  func partA(input: String) throws -> String {
    var sum = 0
    for line in input.split(separator: "\n") {
      let nums = line.map { $0.wholeNumberValue! }
      var highestIdx = 0
      var secondHighestIdx = 1
      for i in 1...(nums.count - 2) {
        if nums[i] > nums[highestIdx] {
          highestIdx = i
        } else if nums[i] > nums[secondHighestIdx] || highestIdx > secondHighestIdx {
          secondHighestIdx = i
        }
      }
      if nums.last! > nums[secondHighestIdx] {
        secondHighestIdx = nums.count - 1
      }
      sum += nums[highestIdx] * 10 + nums[secondHighestIdx]
    }
    return String(sum)
  }

  func partB(input: String) throws -> String {
    let sequenceLength = 12
    var sum = 0
    for line in input.split(separator: "\n") {
      let nums = line.map { $0.wholeNumberValue! }
      var highestIdxInOrder = Array(repeating: 0, count: sequenceLength)
      for i in 1...(nums.count - 1) {
        let lowerLimit = max(0, sequenceLength - nums.count + i)
        for j in (max(0, lowerLimit))..<sequenceLength {
          if nums[i] > nums[highestIdxInOrder[j]] {
            highestIdxInOrder[j] = i
            break
          } else if j > 0 && highestIdxInOrder[j] <= highestIdxInOrder[j-1] {
            highestIdxInOrder[j] = i
            break
          }
        }
      }
      var subSum = 0
      for i in 0..<sequenceLength {
        subSum *= 10
        subSum += nums[highestIdxInOrder[i]]
      }
      sum += subSum
    }
    return String(sum)
  }
}

import Foundation

struct Solution5: Solution {
  func partA(input: String) throws -> String {
    var sum = 0
    var inRanges = true
    var ranges: [Range<Int>] = []

    for line in input.split(separator: "\n", omittingEmptySubsequences: false) {
      if inRanges {
        if line == "" {
          inRanges = false
          ranges = prepareRangesForBinarySearch(ranges)
          continue
        }

        let range = line.split(separator: "-")
        let from = Int(range[0])!
        let to = Int(range[1])!
        ranges.append(Range(from...to))
      } else {
        if line == "" { continue }
        let num = Int(line)!

        if binarySearch(ranges: ArraySlice(ranges), num: num) {
          sum += 1
        }
      }
    }

    return String(sum)
  }

  func partB(input: String) throws -> String {
    var sum = 0
    var ranges: [Range<Int>] = []

    for line in input.split(separator: "\n", omittingEmptySubsequences: false) {
      if line == "" {
        break
      }

      let range = line.split(separator: "-")
      let from = Int(range[0])!
      let to = Int(range[1])!
      ranges.append(Range(from...to))
    }

    ranges.sort { $0.lowerBound < $1.lowerBound }

    var lastCounted = 0
    for range in ranges {
      if range.lowerBound > lastCounted {
        // New range detached from already counted ranges
        sum += range.count
        lastCounted = range.upperBound
      }
      if range.upperBound > lastCounted {
        // New range overlaps with already counted ranges
        sum += range.count - (lastCounted - range.lowerBound)
        lastCounted = range.upperBound
      }
    }

    return String(sum)
  }

  func prepareRangesForBinarySearch(_ ranges: [Range<Int>]) -> [Range<Int>] {
    var ranges = ranges
    ranges.sort { $0.lowerBound < $1.lowerBound }

    // Remove fully overlapping ranges (Those mess up binary partitioning)
    var i = 1
    while i < ranges.count {
      let prevRange = ranges[i - 1]
      let range = ranges[i]
      if prevRange.lowerBound <= range.lowerBound && prevRange.upperBound >= range.upperBound {
        ranges.remove(at: i)
      } else {
        i += 1
      }
    }
    return ranges
  }

  func binarySearch(ranges: ArraySlice<Range<Int>>, num: Int) -> Bool {
    if ranges.isEmpty {
      return false
    }
    let mid = ranges.startIndex + ranges.count / 2
    if ranges[mid].contains(num) {
      return true
    } else if ranges[mid].lowerBound > num {
      return binarySearch(ranges: ranges[ranges.startIndex..<mid], num: num)
    } else {
      return binarySearch(ranges: ranges[(mid + 1)..<ranges.endIndex], num: num)
    }
  }
}

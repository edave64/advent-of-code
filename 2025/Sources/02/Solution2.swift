import Foundation

struct Solution2 : Solution {
  func partA(input: String) throws -> String {
    let ranges = input.split(separator: ",")
    var res = 0
    var sum: Int64 = 0
    for range in ranges {
      let range = range.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines).split(separator: "-")
      let start = Int(range[0])!
      let end = Int(range[1])!

      let sections = splitSectionByMagnitude(start: start, end: end)

      for (start, end) in sections {
        let mag = getMagnitude(start)
        // Odd numbered regions can't contain repeating ids
        if mag % 2 == 1 { continue }

        let mask = Int(pow(10.0, (Double(mag) / 2.0)))

        let startA = start / mask
        let startB = start % mask
        let endA = end / mask
        let endB = end % mask

        let startVal = startB > startA ? startA + 1 : startA
        let endVal = endB >= endA ? endA : endA - 1

        if endVal < startVal { continue }

        for i in startVal...endVal {
          sum += Int64(mask * i + i)
        }

        res += endVal - startVal + 1
      }
    }
    return String(sum)
  }

  func partB(input: String) throws -> String {
    let ranges = input.split(separator: ",")
    var sum: Int64 = 0
    var factors = Factors()
    for range in ranges {
      let range = range.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines).split(separator: "-")
      let start = Int(range[0])!
      let end = Int(range[1])!

      let sections = splitSectionByMagnitude(start: start, end: end)

      for (start, end) in sections {
        let mag = getMagnitude(start)
        // Single numbers can't contain repeating digits
        if mag == 1 { continue }
        let factors = factors.factors(mag)
        var alreadyCounted = Set<Int64>()

        for f: Int in factors {
          //print(f)
          let startSplit = splitByFactor(num: start, magnitude: mag, factor: f)
          let endSplit = splitByFactor(num: end, magnitude: mag, factor: f)

          var startVal = startSplit[0]
          var endVal = endSplit[0]
          
          for startNum in startSplit.dropFirst() {
            if startNum < startVal { break }
            if startNum > startVal { startVal += 1; break }
          }
          
          for endNum in endSplit.dropFirst() {
            if endNum > endVal { break }
            if endNum < endVal { endVal -= 1; break }
          }
          
          if endVal < startVal { continue }

          let stride = mag / f
          let mask = Int64(pow(10.0, Double(f)))

          for i in startVal...endVal {
            var subSum: Int64 = 0
            for _ in 0..<stride {
              subSum *= mask
              subSum += Int64(i)
            }
            if alreadyCounted.contains(subSum) { continue }
            //print(subSum)
            sum += Int64(subSum)
            alreadyCounted.insert(subSum)
          }
        }
      }
    }
    return String(sum)
  }

  func splitByFactor(num: Int, magnitude: Int, factor: Int) -> [Int] {
    var val = num
    let stride = magnitude / factor
    let mask = Int(pow(10.0, Double(factor)))
    var slices = Array(repeating: 0, count: stride)
    for i in 0..<stride {
      slices[stride-i-1] = val % mask
      val /= mask
    }
    return slices
  }

  func splitSectionByMagnitude(start: Int, end: Int) -> [(Int, Int)] {
    let startMagnitude = getMagnitude(start);
    let endMagnitude = getMagnitude(end);

    if startMagnitude == endMagnitude {
      return [(start, end)]
    }

    var res = [(Int, Int)]()

    for mag in startMagnitude...endMagnitude {
      let minVal = startMagnitude == mag ? start : Int(pow(10.0, Double(mag - 1)))
      let maxVal = endMagnitude == mag ? end : Int(pow(10.0, Double(mag))) - 1
      res.append((minVal, maxVal))
    }

    return res
  }
  
  func getMagnitude(_ num: Int) -> Int {
    return Int(log10(Double(num)) + 1)
  }

  func iMod(_ a: Int, _ b: Int) -> Int {
    return (a % b + b) % b
  }
}

struct Factors {
  var factorCache = [Int: [Int]]()

  mutating func factors(_ num: Int) -> [Int] {
    if num == 2 { return [1] }
    if let cached = factorCache[num] { return cached }

    var res = [Int]()

    for i in 1...Int(Double(num) / 2 + 1) {
      if num % i == 0 {
        res.append(i)
      }
    }

    factorCache[num] = res
    return res
  }
}
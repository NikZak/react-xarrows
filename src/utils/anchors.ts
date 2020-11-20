/**
 * utility functions for preparing `startAnchor` and `endAnchor` to accept the diffrent types that can be passed.
 */

import { anchorCustomPositionType, anchorPositionType } from '../index'
import { typeOf } from './index'

const getAnchorsDefaultOffsets = (width: number, height: number) => {
  return {
    middle: { rightness: width * 0.5, bottomness: height * 0.5 },
    left: { rightness: 0, bottomness: height * 0.5 },
    left_bottom: { rightness: 0, bottomness: height },
    left_top: { rightness: 0, bottomness: 0 },
    right: { rightness: width, bottomness: height * 0.5 },
    right_bottom: { rightness: width, bottomness: height },
    right_top: { rightness: width, bottomness: 0 },
    top: { rightness: width * 0.5, bottomness: 0 },
    bottom: { rightness: width * 0.5, bottomness: height },
  }
}

type anchorSideType = 'left' | 'right' | 'top' | 'bottom' | 'left_bottom'

export const prepareAnchorLines = (anchor: any, anchorPos: any) => {
  let defsOffsets = getAnchorsDefaultOffsets(
    anchorPos.right - anchorPos.x,
    anchorPos.bottom - anchorPos.y,
  )
  // convert given anchors to array if array not already given
  let anchorChoice = Array.isArray(anchor) ? anchor : [anchor]
  if (anchorChoice.length === 0) anchorChoice = ['auto']
  //now map each item in the list to relevant object
  let anchorChoiceMapped = anchorChoice.map((anchorChoice) => {
    if (typeOf(anchorChoice) === 'string') {
      anchorChoice = anchorChoice as anchorPositionType
      return {
        position: anchorChoice,
        offset: { rightness: 0, bottomness: 0 },
      }
    } else if (typeOf(anchorChoice) === 'object') {
      if (!anchorChoice.offset)
        anchorChoice.offset = { rightness: 0, bottomness: 0 }
      if (!anchorChoice.offset.bottomness) anchorChoice.offset.bottomness = 0
      if (!anchorChoice.offset.rightness) anchorChoice.offset.rightness = 0
      anchorChoice = anchorChoice as anchorCustomPositionType
      return anchorChoice
    }
    return {}
  })
  //now build the object that represents the users possibilities for different anchors
  let anchorPossibilities: anchorCustomPositionType[] = []
  if (anchorChoiceMapped.map((a) => a.position).includes('auto')) {
    let autoAnchor = anchorChoiceMapped.find((a) => a.position === 'auto')
    ;(['left', 'right', 'top', 'bottom'] as anchorSideType[]).forEach(
      (anchor) => {
        let offset = defsOffsets[anchor]
        offset.rightness += autoAnchor.offset.rightness
        offset.bottomness += autoAnchor.offset.bottomness
        anchorPossibilities.push({ position: anchor, offset })
      },
    )
  } else {
    anchorChoiceMapped.forEach((customAnchor) => {
      let offset = defsOffsets[
        customAnchor.position as anchorSideType | 'middle'
      ] as {
        rightness: number
        bottomness: number
      }
      offset.rightness += customAnchor.offset.rightness
      offset.bottomness += customAnchor.offset.bottomness
      anchorPossibilities.push({
        position: customAnchor.position as anchorPositionType,
        offset,
      })
    })
  }
  // now prepare this list of anchors to object expected by the `getShortestLine` function
  return anchorPossibilities.map((pos) => ({
    x: anchorPos.x + pos.offset.rightness,
    y: anchorPos.y + pos.offset.bottomness,
    anchorPosition: pos.position as anchorPositionType,
  }))
}

const dist = (p1: any, p2: any) => {
  //length of line
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

type t1 = { x: number; y: number; anchorPosition?: anchorPositionType }

export const getShortestLine = (sPoints: t1[], ePoints: t1[]) => {
  // closes tPair Of Points which feet to the specified anchors
  let minDist = Infinity,
    d = Infinity
  var closestPair: { startPointObj: t1; endPointObj: t1 } = {
    startPointObj: { x: 0, y: 0 },
    endPointObj: { x: 0, y: 0 },
  }
  sPoints.forEach((sp) => {
    ePoints.forEach((ep) => {
      d = dist(sp, ep)
      if (d < minDist) {
        minDist = d
        closestPair = { startPointObj: sp, endPointObj: ep }
      }
    })
  })
  return closestPair
}

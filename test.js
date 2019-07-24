function quickSort (arr) {
    if (!arr.length) {
        return arr
    } else{
        let primaryArr = Array.from(arr)
        let half = Math.floor(primaryArr.length/2)
        let rightArr = primaryArr.filter(val => val > primaryArr[half])
        let leftArr = primaryArr.filter(val => val < primaryArr[half])
        let centerArr = primaryArr.filter(val => val == primaryArr[half])        
        return quickSort(leftArr).concat(centerArr, quickSort(rightArr))
    }
}
let arrSort = [2,3,6,4,6,43,23,43,45,76,17,90,12];
let arr1 = quickSort(arrSort);
console.log(arr1);
  
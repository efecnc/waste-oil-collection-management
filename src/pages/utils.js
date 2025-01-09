import { collection, getDocs } from "firebase/firestore"
import { db } from '../firebase'
import * as XLSX from 'xlsx'

export const fetchStokData = async (setStokData) => {
  const querySnapshot = await getDocs(collection(db, "stok"))
  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  data.sort((a, b) => new Date(b.Tarih) - new Date(a.Tarih))
  setStokData(data)
}

export const downloadExcel = (stokData) => {
  const dataToExport = stokData.map(item => ({
    "Araç": item["Araç"],
    "Tarih": item["Tarih"],
    "Araç Üstü": item["Araç Üstü"],
    "Depoya İnen": item["Depoya İnen"],
    "Mal Fazlası": item["Araç Üstü"] - item["Depoya İnen"],
    "Toplam Ödeme": item["Toplam Ödeme"],
    "Notlar": item["Notlar"]
  }))
  const worksheet = XLSX.utils.json_to_sheet(dataToExport)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Listesi")
  XLSX.writeFile(workbook, "stok_listesi.xlsx")
}

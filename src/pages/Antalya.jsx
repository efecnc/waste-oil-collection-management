import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from '../firebase'
import './Antalya.css'
import * as XLSX from 'xlsx'
import { FaFileExcel } from 'react-icons/fa'

function Antalya() {
  const [count, setCount] = useState(0)
  const [firstValue, setFirstValue] = useState(null)
  const [secondValue, setSecondValue] = useState(null)
  const [thirdValue, setThirdValue] = useState(null)
  const [fourthValue, setFourthValue] = useState(null)
  const [fifthValue, setFifthValue] = useState(null)
  const [sixthValue, setSixthValue] = useState(null)
  const [seventhValue, setSeventhValue] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [notes, setNotes] = useState("")
  const [stokData, setStokData] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [editId, setEditId] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [filterVehicle, setFilterVehicle] = useState("")
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isFormActive, setIsFormActive] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState("")
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false)
  const [newVehicle, setNewVehicle] = useState("")
  const [error, setError] = useState("")
  const [collectionPointCount, setCollectionPointCount] = useState(null)

  const handleClick = (e) => {
    e.preventDefault()
    setCount(firstValue - secondValue)
  }

  const resetForm = () => {
    setFirstValue(null)
    setSecondValue(null)
    setThirdValue(null)
    setFourthValue(null)
    setFifthValue(null)
    setSixthValue(null)
    setSeventhValue(null)
    setVehicle(null)
    setNotes("")
    setDate(new Date().toISOString().split('T')[0])
    setCount(0)
    setError("")
    setCollectionPointCount(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!firstValue && !secondValue && !thirdValue && !vehicle && !date && !notes && !collectionPointCount) {
      setError("Lütfen en az bir alanı doldurun.")
      return
    }
    const calculatedCount = firstValue - secondValue
    const data = {
      "Araç Üstü": firstValue,
      "Depoya İnen": secondValue,
      "Toplam Ödeme": thirdValue,
      "Araç": vehicle,
      "Tarih": date,
      "Mal Fazlası": calculatedCount,
      "Notlar": notes,
      "Giriş Tarihi": new Date().toISOString(),
      "Toplama Noktası Sayısı": collectionPointCount
    }
    if (editId) {
      try {
        const docRef = doc(db, "stok", editId)
        await updateDoc(docRef, data)
        alert("Data updated successfully!")
        setEditId(null)
      } catch (e) {
        console.error("Error updating document: ", e.message)
        alert("Error updating data.")
      }
    } else {
      try {
        await addDoc(collection(db, "stok"), data)
        alert("Data saved successfully!")
      } catch (e) {
        console.error("Error adding document: ", e.message)
        alert("Error saving data.")
      }
    }
    fetchStokData()
    resetForm()
    setIsFormActive(false)
  }

  const fetchStokData = async () => {
    const querySnapshot = await getDocs(collection(db, "stok"))
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    data.sort((a, b) => new Date(a["Giriş Tarihi"]) - new Date(b["Giriş Tarihi"]))
    setStokData(data)
  }

  const fetchVehicles = async () => {
    const querySnapshot = await getDocs(collection(db, "vehicles"))
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setVehicles(data)
  }

  const handleNewRecord = () => {
    resetForm()
    setEditId(null)
    setIsFormActive(true)
  }

  const handleEdit = (item) => {
    setEditId(item.id)
    setFirstValue(item["Araç Üstü"])
    setSecondValue(item["Depoya İnen"])
    setThirdValue(item["Toplam Ödeme"])
    setVehicle(item["Araç"])
    setDate(item["Tarih"])
    setCount(item["Araç Üstü"] - item["Depoya İnen"])
    setNotes(item["Notlar"])
    setCollectionPointCount(item["Toplama Noktası Sayısı"])
    setIsFormActive(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "stok", id))
      alert("Data deleted successfully!")
      fetchStokData()
    } catch (e) {
      console.error("Error deleting document: ", e.message)
      alert("Error deleting data.")
    }
  }

  const handleCloseForm = () => {
    resetForm()
    setIsFormActive(false)
  }

  const handleOpenModal = (content) => {
    setModalContent(content)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalContent("")
  }

  const handleOpenVehicleModal = () => {
    setIsVehicleModalOpen(true)
  }

  const handleCloseVehicleModal = () => {
    setIsVehicleModalOpen(false)
    setNewVehicle("")
  }

  const handleSaveVehicle = async (e) => {
    e.preventDefault()
    if (!newVehicle) {
      alert("Lütfen araç ismini girin.")
      return
    }
    try {
      await addDoc(collection(db, "vehicles"), { name: newVehicle })
      alert("Araç eklendi!")
      fetchVehicles()
      handleCloseVehicleModal()
    } catch (e) {
      console.error("Error adding vehicle: ", e.message)
      alert("Error adding vehicle.")
    }
  }

  const handleDeleteVehicle = async (id) => {
    try {
      await deleteDoc(doc(db, "vehicles", id))
      alert("Araç silindi!")
      fetchVehicles()
    } catch (e) {
      console.error("Error deleting vehicle: ", e.message)
      alert("Error deleting vehicle.")
    }
  }

  const handleDownloadExcel = () => {
    const dataToExport = filteredStokData.map(({ id, ...rest }) => ({
      "Araç": rest["Araç"],
      "Tarih": rest["Tarih"],
      "Araç Üstü": rest["Araç Üstü"],
      "Depoya İnen": rest["Depoya İnen"],
      "Mal Fazlası": rest["Araç Üstü"] - rest["Depoya İnen"],
      "Toplam Ödeme (TL)": rest["Toplam Ödeme"],
      "Yapılan Ödeme (TL)": rest["Yapılan Ödeme"],
      "Toplama Noktası Sayısı": rest["Toplama Noktası Sayısı"],
      "Ortalama Araç Üstü": isNaN(rest["Toplam Ödeme"] / rest["Araç Üstü"]) ? '' : (rest["Toplam Ödeme"] / rest["Araç Üstü"]).toFixed(2),
      "Ortalama Depoya İnen": isNaN(rest["Toplam Ödeme"] / rest["Depoya İnen"]) ? '' : (rest["Toplam Ödeme"] / rest["Depoya İnen"]).toFixed(2),
      "Notlar": rest["Notlar"]
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Data");
    XLSX.writeFile(workbook, "stok_data.xlsx");
  }

  useEffect(() => {
    fetchStokData()
    fetchVehicles()
  }, [])

  const filteredStokData = stokData.filter(item => {
    const itemDate = new Date(item["Tarih"]);
    const itemMonth = itemDate.toISOString().slice(0, 7);
    return (filterVehicle ? item["Araç"] === filterVehicle : true) &&
           (filterMonth ? itemMonth === filterMonth : true);
  });

  return (
    <>
      <h2 className="center">Antalya</h2>
      <div className="actions center">
        <button className="new-record-button" onClick={handleNewRecord}>
          Yeni Kayıt
        </button>
        <button className="new-record-button" onClick={handleOpenVehicleModal}>
          Araçları Yönet
        </button>
      </div>
      {isFormActive && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseForm}>X</button>
            <form className="form">
              {error && <p className="error">{error}</p>}
              <div className='form-item'>
                <label>Araç Seçin</label>
                <select name="vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                  <option value="">Araç Seçin</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-item">
                <label>Araç Üstü Stok</label>
                <input type="number" value={firstValue || ''} onChange={(e) => setFirstValue(Number(e.target.value))} />
              </div>
              <div className="form-item">
                <label>Depoya İnen Stok</label>
                <input type="number" value={secondValue || ''} onChange={(e) => setSecondValue(Number(e.target.value))} onMouseLeave={handleClick} />
              </div>
              <div className="form-item">
                <label>Toplam Ödeme (TL)</label>
                <input type="number" value={thirdValue || ''} onChange={(e) => setThirdValue(Number(e.target.value))} />
              </div>
              <div className="form-item">
                <label>Yapılan Ödeme (TL)</label>
                <input type="number" value={seventhValue || ''} onChange={(e) => setSeventhValue(Number(e.target.value))} />
              </div>
              <div className="form-item">
                <label>Toplama Noktası Sayısı</label>
                <input type="number" value={collectionPointCount || ''} onChange={(e) => setCollectionPointCount(Number(e.target.value))} />
              </div>
              <div className="form-item">
                <label>Tarih</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-item">
                <label>Notlar</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="form-buttons">
                <button className="save-button" onClick={handleSave}>
                  {editId ? "Güncelle" : "Kaydet"}
                </button>
                <button className="close-button" onClick={handleCloseForm}>
                  Kapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isVehicleModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseVehicleModal}>X</button>
            <form className="form">
              <div className="form-item">
                <label>Araç İsmi</label>
                <input type="text" value={newVehicle} onChange={(e) => setNewVehicle(e.target.value)} />
              </div>
              <div className="form-buttons">
                <button className="save-button" onClick={handleSaveVehicle}>
                  Kaydet
                </button>
                <button className="close-button" onClick={handleCloseVehicleModal}>
                  Kapat
                </button>
              </div>
            </form>
            <div className="vehicle-list">
              <h3>Mevcut Araçlar</h3>
              <ul>
                {vehicles.map((v) => (
                  <li key={v.id}>
                    {v.name}
                    <button className="delete-button" onClick={() => handleDeleteVehicle(v.id)}>Sil</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="stok-list">
        <div className="filter">
          <label htmlFor="filterVehicle">Araç Filtrele: </label>
          <select id="filterVehicle" value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
            <option value="">Hepsi</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.name}>{v.name}</option>
            ))}
          </select>
          <label htmlFor="filterMonth">Ay Filtrele: </label>
          <input type="month" id="filterMonth" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
          <button className="download" onClick={handleDownloadExcel}>
            <FaFileExcel />
          </button>
        </div>
        <table className="stok-table">
          <thead>
            <tr>
              <th>Araç</th>
              <th>Tarih</th>
              <th>Araç Üstü</th>
              <th>Depoya İnen</th>
              <th>Mal Fazlası</th>
              <th>Toplam Ödeme (TL)</th>
              <th>Yapılan Ödeme (TL)</th>
              <th>Toplama Noktası Sayısı</th>
              <th>Ortalama Araç Üstü</th>
              <th>Ortalama Depoya İnen</th>
              <th>Notlar</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredStokData.map((item, index) => (
              <tr key={index}>
                <td>{item["Araç"]}</td>
                <td>{item["Tarih"]}</td>
                <td>{item["Araç Üstü"]}</td>
                <td>{item["Depoya İnen"]}</td>
                <td>{item["Araç Üstü"] - item["Depoya İnen"]}</td>
                <td>{item["Toplam Ödeme"]} TL</td>
                <td>{item["Yapılan Ödeme"]} TL</td>
                <td>{item["Toplama Noktası Sayısı"]}</td>
                <td>{isNaN(item["Toplam Ödeme"] / item["Araç Üstü"]) ? '' : (item["Toplam Ödeme"] / item["Araç Üstü"]).toFixed(2)}</td>
                <td>{isNaN(item["Toplam Ödeme"] / item["Depoya İnen"]) ? '' : (item["Toplam Ödeme"] / item["Depoya İnen"]).toFixed(2)}</td>
                <td>
                  <button className="view-note-button" onClick={() => handleOpenModal(item["Notlar"])}>
                    Notu Gör
                  </button>
                </td>
                <td>
                  <button className="edit-button" onClick={() => handleEdit(item)}>Düzenle</button>
                  <button className="delete-button" onClick={() => handleDelete(item.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Notlar</h2>
            <p>{modalContent}</p>
            <button className="close-button" onClick={handleCloseModal}>Kapat</button>
          </div>
        </div>
      )}
    </>
  )
}

export default Antalya

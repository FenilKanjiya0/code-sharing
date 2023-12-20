import React, { useState, useRef, useEffect } from 'react'

import useFetchData from 'hooks/fetch-data'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { getFormatedDate } from 'helpers/getDateTime'
import { get, isEmpty, orderBy, uniqBy, uniq } from 'lodash'
import { getStatus, conditionOptions, criticalityOptions, thermalClassificationOptions, addedAssetTypeOptions } from './utils'
import { Toast } from 'Snackbar/useToast'
import enums from 'Constants/enums'
import URL from 'Constants/apiUrls'
import { nanoid } from 'nanoid'

import SearchComponent from 'components/common/search'
import { StatusComponent, LabelVal, Menu, PopupModal, FilterPopup, DropDownMenu } from 'components/common/others'
import { MinimalButton, ActionButton, MinimalButtonGroup } from 'components/common/buttons'
import { MinimalTextArea } from 'components/Assets/components'
import { TableComponent } from 'components/common/table-components'
import { TopSubTableComponent, TopSubTableHeader } from 'components/common/top-sub-table-component'
import View from 'components/WorkOrders/onboarding/view'
import Edit from 'components/WorkOrders/onboarding/edit'
import DialogPrompt from 'components/DialogPrompt'
import EditWO from 'components/WorkOrders/EditWO'
import UploadedPreview from 'components/WorkOrders/onboarding/uploaded-preview'
import { CompletionStatus } from 'components/WorkOrders/components'
import Review from 'components/WorkOrders/onboarding/review'

import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'
import Checkbox from '@material-ui/core/Checkbox'
import AddIcon from '@material-ui/icons/Add'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import PhotoLibraryOutlinedIcon from '@material-ui/icons/PhotoLibraryOutlined'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import { AppBar } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'
import NewIssues from 'components/WorkOrders/issues'
import AddExistingAsset from 'components/WorkOrders/onboarding/add-existing-asset'
import Locations from 'components/WorkOrders/locations'
import UploadIrPhotos from 'components/WorkOrders/onboarding/upload-ir-photos'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import assetClass from 'Services/WorkOrder/asset-class'
import workorder from 'Services/WorkOrder/common'
import locations from 'Services/locations'

import XLSX from 'xlsx'
import * as yup from 'yup'
import $ from 'jquery'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { history } from 'helpers/history'

const OnBoardingWorkOrder = ({ workOrderID }) => {
  const [isReadMore, setReadMore] = useState(false)
  const [rows, setRows] = useState([])
  const [addingAssetLocation, setAddingAssetLocation] = useState({})
  const formatDetails = d => {
    try {
      const rows = get(d, 'data.assetDetails', [])
      rows.forEach(d => {
        d.assetId = isEmpty(uniq(d.assetId).filter(d => !['0', '-'].includes(d))) ? null : d.assetId
        d.toplevelcomponentAssetId = isEmpty(uniq(d.toplevelcomponentAssetId).filter(d => !['0', '-'].includes(d))) ? null : d.toplevelcomponentAssetId
      })
      const sortedRows = orderBy(rows, [d => d.building && d.building.toLowerCase(), d => d.floor && d.floor.toLowerCase(), d => d.room && d.room.toLowerCase(), d => d.section && d.section.toLowerCase(), d => d.assetName && d.assetName.toLowerCase()], ['asc', 'asc', 'asc', 'asc', 'asc'])
      const classOpts = []
      const classCodeOpts = []
      const buildingOpts = []
      const floorOpts = []
      const roomOpts = []
      const sectionOpts = []
      const statusOpts = []
      if (!isEmpty(rows)) {
        rows.forEach(data => {
          classOpts.push({ label: data.assetClassName, value: data.assetClassName })
          classCodeOpts.push({ label: data.assetClassCode, value: data.assetClassCode })
          if (data.building) buildingOpts.push({ label: data.building, value: data.building })
          if (data.floor) floorOpts.push({ label: data.floor, value: data.floor })
          if (data.room) roomOpts.push({ label: data.room, value: data.room })
          if (data.section) sectionOpts.push({ label: data.section, value: data.section })
          const { label } = getStatus(data.status)
          statusOpts.push({ label, value: data.status })
        })
      }
      setAssetClassOptions(orderBy(uniqBy(classOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setAssetClassCodeOptions(orderBy(uniqBy(classCodeOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setBuildingOptions(orderBy(uniqBy(buildingOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setFloorOptions(orderBy(uniqBy(floorOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setRoomOptions(orderBy(uniqBy(roomOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setSectionOptions(orderBy(uniqBy(sectionOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setStatusOptions(orderBy(uniqBy(statusOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      d.data.assetDetails = sortedRows
      checkOriginWoLineId(sortedRows)
      setAddingAssetLocation({})
      return camelizeKeys(get(d, 'data', {}))
    } catch (error) {
      console.log(error)
    }
  }
  const sortClassCodes = d => {
    const list = get(d, 'data', {})
    list.forEach(d => {
      d.id = d.value
      d.value = d.className
    })
    const sortedList = orderBy(list, [d => d.label && d.label.toLowerCase()], 'asc')
    return sortedList
  }
  const { loading, data, reFetch } = useFetchData({ fetch: onBoardingWorkorder.getWorkOrderDetail, payload: { id: workOrderID }, formatter: d => formatDetails(d), externalLoader: true })
  const { data: classCodeOptions } = useFetchData({ fetch: assetClass.getAllAssetClassCodes, formatter: d => sortClassCodes(d) })
  const [tempBuildings, setTempBuildings] = useState([])
  const formatBuildings = list => {
    const buildings = [...list].map(d => ({ ...d, label: d.tempFormioBuildingName, value: d.tempFormiobuildingId }))
    setTempBuildings(buildings)
  }
  const { reFetch: reFetchLocations } = useFetchData({ fetch: locations.workOrder.get, payload: { id: workOrderID }, formatter: d => formatBuildings(get(d, 'data.tempBuildings', [])), defaultValue: [] })
  const { color, label } = getStatus(data.woStatusId)
  const uploadAssetRef = useRef(null)
  const [error, setError] = useState('')
  const [isOverride, setOverride] = useState(false)
  const [woCompLoading, setWOCompLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  //
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [actionObj, setActionObj] = useState({})
  const [deleteObj, setDeleteObj] = useState({})
  const [actionLoader, setActionLoader] = useState(false)
  const [reason, setReason] = useState('')
  const isOnboarding = data.woType === enums.woType.OnBoarding
  const [searchString, setSearchString] = useState('')
  //filter
  const [assetClassOptions, setAssetClassOptions] = useState([])
  const [selectedAssetClass, setSelectedAssetClass] = useState({})
  const [assetClassCodeOptions, setAssetClassCodeOptions] = useState([])
  const [selectedAssetClassCode, setSelectedAssetClassCode] = useState({})
  const [buildingOptions, setBuildingOptions] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState({})
  const [floorOptions, setFloorOptions] = useState([])
  const [selectedFloor, setSelectedFloor] = useState({})
  const [roomOptions, setRoomOptions] = useState([])
  const [selectedRoom, setSelectedRoom] = useState({})
  const [sectionOptions, setSectionOptions] = useState([])
  const [selectedSection, setSelectedSection] = useState({})
  const [statusOptions, setStatusOptions] = useState([])
  const [selectedStatus, setSelectedStatus] = useState({})
  const uploadIrPhotoRef = useRef(null)
  const [uploadPreviewOpen, setUploadPreviewOpen] = useState(false)
  const [uploadPreviewFiles, setUploadPreviewFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  //const [fetchingUploaded, setFetchingUploaded] = useState(false)
  const optionsObjects = {
    COND: conditionOptions,
    CRIT: criticalityOptions,
    TC: thermalClassificationOptions,
  }
  const [isEditWO, setIsEditWO] = useState(false)
  const uploadTabs = { UPLOAD: 'UPLOAD', UPLOADED: 'UPLOADED_PHOTOS' }
  const [selectedTab, setTab] = useState(uploadTabs.UPLOAD)
  const [pdfProcessing, setPdfProcessing] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  //tabs
  const [mainTab, setMainTab] = useState('DEFAULT')
  //
  const [completionProcessStatus, setCompletionProcessStatus] = useState(null)
  const IsCompletionInProgress = completionProcessStatus === enums.WO_COMPLETION_STATUS.IN_PROGRESS
  //add old asset
  const [isAddAssetPopupOpen, setIsAddAssetPopupOpen] = useState(false)
  const [addedAssetType, setAddedAssetType] = useState(0)
  const [isAddExistingAssetOpen, setIsAddExistingAssetOpen] = useState(false)
  //
  const [originIssueOpened, setOriginIssueOpened] = useState(false)
  const [hierarchy, setHierarchy] = useState({
    topLevel: [],
    noLevel: [],
    isExpanded: false,
  })
  const [isShowMore, setShowMore] = useState(false)
  //locations

  //components
  const renderDescription = () => (
    <>
      <div>
        {data.description && data.description.slice(0, 150)}
        {!isReadMore && data.description.length > 150 && <span>...</span>}
        {isReadMore && data.description.slice(150)}
      </div>
      {data.description.length > 150 && (
        <button className='readmore-button text-xs' onClick={() => setReadMore(!isReadMore)} style={{ color: '#778899' }}>
          {!isReadMore ? 'Read More' : 'Read less'}
        </button>
      )}
    </>
  )
  //functions
  const handleUploadAsset = () => {
    setError('')
    uploadAssetRef.current && uploadAssetRef.current.click()
  }
  const addAsset = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) setError('Invalid file format !')
      else {
        setError('')
        const binaryStr = d.target.result
        const wb = XLSX.read(binaryStr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        validateSheet(data)
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = null
  }
  const getEnableStatus = () => {
    if (woCompLoading) return true
    if (IsCompletionInProgress) return true
    else if (data.woStatusId === enums.woTaskStatus.Complete || data.woStatusId === enums.woTaskStatus.Submitted) return true
    else if (isEmpty(get(data, 'assetDetails', []))) return true
    else return false
  }
  const checkCompWOEnableStatus = () => {
    if (woCompLoading) return true
    if (IsCompletionInProgress) return true
    else if (data.woStatusId === enums.woTaskStatus.Complete) return true
    else if (isOverride) return false
    else if ([...new Set(get(data, 'assetDetails', []).map(d => d.status))].length === 1 && [...new Set(get(data, 'assetDetails', []))][0].status === enums.woTaskStatus.Complete) return false
    else if ([...new Set(get(data, 'assetDetails', []).map(d => d.status))].length === 1 && [...new Set(get(data, 'assetDetails', []))][0].status === enums.woTaskStatus.Submitted) return false
    else return true
  }
  const handleAction = async (type, obj) => {
    if (type === 'DELETE') return deleteAssetAction({ woonboardingassetsId: obj.woonboardingassetsId })
    if (type === 'REJECT') return rejectAssetAction({ woonboardingassetsId: obj.woonboardingassetsId })
    if (['ACCEPT', 'HOLD', 'REVERT'].includes(type)) return updateAssetStatusAction({ woonboardingassetsId: obj.woonboardingassetsId, status: type })
    setActionLoader(obj.woonboardingassetsId)
    try {
      const res = await onBoardingWorkorder.getAssetDetail({ id: obj.woonboardingassetsId })
      if (res.success) {
        setActionObj({ ...get(res, 'data', {}), woId: workOrderID })
        if (type === 'VIEW') setIsViewOpen(true)
        if (type === 'EDIT') setIsEditOpen(true)
        setActionLoader('')
      } else {
        setActionLoader('')
        Toast.error(res.message || 'Something went wrong !')
      }
    } catch (error) {
      setActionLoader('')
      Toast.error('Something went wrong !')
    }
  }
  const deleteAssetAction = ({ woonboardingassetsId }) => {
    setIsDeleteOpen(true)
    setDeleteObj({ woonboardingassetsId })
    return
  }
  const rejectAssetAction = ({ woonboardingassetsId }) => {
    setIsRejectOpen(true)
    setActionObj({ woonboardingassetsId })
    return
  }
  const updateAssetStatusAction = async payload => {
    const status = { ACCEPT: enums.woTaskStatus.Complete, HOLD: enums.woTaskStatus.Hold, REVERT: enums.woTaskStatus.ReadyForReview }
    payload.status = status[payload.status]
    setActionLoader(payload.woonboardingassetsId)
    try {
      const res = await onBoardingWorkorder.updateAssetStatus(snakifyKeys(payload))
      if (res.success > 0) Toast.success(`Asset Status Updated Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error updating status. Please try again !`)
    }
    setActionLoader('')
    reFetch()
  }
  const rejectAsset = async () => {
    const payload = { ...actionObj, taskRejectedNotes: reason, status: enums.woTaskStatus.Reject }
    setRejectLoading(true)
    try {
      const res = await onBoardingWorkorder.updateAssetStatus(snakifyKeys(payload))
      if (res.success > 0) Toast.success(`Asset Rejected Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error rejecting asset. Please try again !`)
    }
    setRejectLoading(false)
    setIsRejectOpen(false)
    reFetch()
    setReason('')
  }
  const closeRejectReasonModal = () => {
    setReason('')
    setIsRejectOpen(false)
  }
  const getFormattedOptions = (val, type) => {
    if (!val) return null
    const options = optionsObjects[type]
    const op = options.find(d => d.label === val)
    if (!op) return null
    return op.value
  }
  const serialDateToJSDate = serialDate => {
    if (!serialDate) return null
    const hours = Math.floor((serialDate % 1) * 24)
    const minutes = Math.floor(((serialDate % 1) * 24 - hours) * 60)
    const date = new Date(Date.UTC(0, 0, serialDate, hours - 17, minutes))
    return date.toISOString()
  }
  //
  const validateSheet = async data => {
    try {
      const schema = yup.array().of(
        yup.object().shape({
          assetName: yup.string().required('Asset Name is required'),
          assetClassCode: yup.string().required('Asset Class Code is required'),
        })
      )
      const parse = d => (isEmpty(d) ? null : d)
      const payload = data.map(d => ({
        assetName: get(d, 'Asset Name', '').toString().trim(),
        assetClassCode: get(d, 'Asset Class Code', '').toString().trim(),
        backOfficeNote: get(d, 'Back Office Note', '').toString().trim(),
        building: parse(get(d, 'Building', '').toString().trim()),
        floor: parse(get(d, 'Floor', '').toString().trim()),
        room: parse(get(d, 'Room', '').toString().trim()),
        section: parse(get(d, 'Section', '').toString().trim()),
        fieldNote: get(d, 'Field Note', '').toString().trim(),
        qrCode: get(d, 'QR Code', '').toString(),
        conditionIndexType: getFormattedOptions(get(d, 'Condition', '').toString().trim(), 'COND'),
        criticalityIndexType: getFormattedOptions(get(d, 'Criticality', '').toString().trim(), 'CRIT'),
        thermalClassificationId: getFormattedOptions(get(d, 'Thermal Classification', '').toString().trim(), 'TC'),
        commisiionDate: serialDateToJSDate(get(d, 'Commission Date', '')),
        manufacturer: parse(get(d, 'Manufacturer', '').toString().trim()),
        model: parse(get(d, 'Model #', '').toString().trim()),
        voltage: parse(get(d, 'Voltage', '').toString().trim()),
        ratedAmps: parse(get(d, 'Amperage', '').toString().trim()),
        woId: workOrderID,
      }))
      await schema.validate(payload, { abortEarly: false })
      uploadAsset(payload)
    } catch (error) {
      try {
        const lineNo = Number(error.inner[0].path.split('.')[0].match(/\[(.*?)\]/)[1])
        setError(`${error.inner[0].message} on Line [${lineNo + 2}]`)
      } catch (error) {
        Toast.error(`Error reading file !`)
      }
    }
  }
  const uploadAsset = async data => {
    if (isEmpty(data)) return Toast.error(`Selected file does not have any data !`)
    $('#pageLoading').show()
    try {
      const res = await onBoardingWorkorder.uploadAsset(snakifyKeys({ assetData: data }))
      if (res.success > 0) Toast.success(`Asset uploaded Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error uploading Asset. Please try again !`)
    }
    $('#pageLoading').hide()
    reFetch()
    reFetchLocations()
  }
  const completeWO = async () => {
    console.log('completion started')
    if (isEmpty(get(data, 'assetDetails', []))) return Toast.error('Please add atleast one Asset !')
    setWOCompLoading(true)
    try {
      const res = await onBoardingWorkorder.updateWorkorderStatus(snakifyKeys({ woId: workOrderID, status: enums.woTaskStatus.Complete }))
      if (res.success > 0) {
        Toast.success('Workorder completion started !')
        setCompletionProcessStatus(enums.WO_COMPLETION_STATUS.IN_PROGRESS)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error completing workorder. Please try again !')
    }
    setWOCompLoading(false)
    setIsCompleteOpen(false)
    reFetch()
    checkCompletionStatus()
  }
  const deleteAsset = async () => {
    setDeleteLoading(true)
    try {
      const res = await onBoardingWorkorder.deleteAsset(snakifyKeys(deleteObj))
      if (res.success > 0) Toast.success(`Asset Deleted Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error deleting Asset. Please try again !`)
    }
    setDeleteLoading(false)
    setIsDeleteOpen(false)
    reFetch()
    reFetchLocations()
  }
  //
  useEffect(() => {
    const rows = get(data, 'assetDetails', [])
    let filteredRows = [...rows]
    if (!isEmpty(searchString)) {
      filteredRows = rows.filter(
        x =>
          (x.assetName !== null && x.assetName.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.assetClassName !== null && x.assetClassName.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.assetClassCode !== null && x.assetClassCode.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.building !== null && x.building.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.floor !== null && x.floor.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.room !== null && x.room.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.section !== null && x.section.toLowerCase().includes(searchString.toLowerCase()))
      )
    }
    if (!isEmpty(selectedStatus)) filteredRows = filteredRows.filter(x => x.status === selectedStatus.value)
    if (!isEmpty(selectedAssetClassCode)) filteredRows = filteredRows.filter(x => x.assetClassCode === selectedAssetClassCode.value)
    if (!isEmpty(selectedAssetClass)) filteredRows = filteredRows.filter(x => x.assetClassName === selectedAssetClass.value)
    if (!isEmpty(selectedBuilding)) filteredRows = filteredRows.filter(x => x.building === selectedBuilding.value)
    if (!isEmpty(selectedFloor)) filteredRows = filteredRows.filter(x => x.floor === selectedFloor.value)
    if (!isEmpty(selectedRoom)) filteredRows = filteredRows.filter(x => x.room === selectedRoom.value)
    if (!isEmpty(selectedSection)) filteredRows = filteredRows.filter(x => x.section === selectedSection.value)
    setRows(filteredRows)
  }, [searchString, selectedStatus, selectedAssetClassCode, selectedAssetClass, selectedBuilding, selectedFloor, selectedRoom, selectedSection, loading])
  //
  const renderText = text => (isEmpty(text) ? 'N/A' : text)
  const menuOptions = [
    { id: 2, name: 'Edit', action: d => handleAction('EDIT', d), disabled: d => IsCompletionInProgress || d.status === enums.woTaskStatus.Complete || data.woStatusId === enums.woTaskStatus.Complete },
    { id: 3, name: 'Accept', action: d => handleAction('ACCEPT', d), disabled: d => IsCompletionInProgress || d.status !== enums.woTaskStatus.ReadyForReview || data.woStatusId === enums.woTaskStatus.Complete },
    { id: 4, name: 'Reject', action: d => handleAction('REJECT', d), disabled: d => IsCompletionInProgress || d.status !== enums.woTaskStatus.ReadyForReview || data.woStatusId === enums.woTaskStatus.Complete },
    { id: 5, name: 'Hold', action: d => handleAction('HOLD', d), disabled: d => IsCompletionInProgress || d.status !== enums.woTaskStatus.ReadyForReview || data.woStatusId === enums.woTaskStatus.Complete },
    { id: 6, name: 'Delete', action: d => handleAction('DELETE', d), color: '#FF0000', disabled: d => IsCompletionInProgress || d.status === enums.woTaskStatus.Complete || data.woStatusId === enums.woTaskStatus.Complete },
    { id: 7, name: 'Revert', action: d => handleAction('REVERT', d), disabled: d => IsCompletionInProgress || d.status !== enums.woTaskStatus.Complete || data.woStatusId === enums.woTaskStatus.Complete },
  ]
  const columns = [
    {
      name: 'Asset Name',
      render: d => {
        return (
          <div className='d-flex align-items-center' style={{ paddingLeft: d.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL ? '' : '10px', marginLeft: d.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL ? '-8px' : 0 }}>
            {d.isExpanded ? <ActionButton action={e => handleSubExpand(d, e)} tooltip='COLLAPSE' icon={<ExpandMoreIcon fontSize='small' />} /> : <ActionButton hide={isEmpty(d.subLevelComponent)} isLoading={d.loading} action={e => handleSubExpand(d, e)} tooltip='EXPAND' icon={<ChevronRightIcon fontSize='small' />} />}
            {renderText(d.assetName)}
          </div>
        )
      },
    },
    { name: 'Asset Class Code', accessor: 'assetClassCode' },
    { name: 'Asset Class', render: d => renderText(d.assetClassName) },
    { name: 'Building', render: d => renderText(d.building) },
    { name: 'Floor', render: d => renderText(d.floor) },
    { name: 'Room', render: d => renderText(d.room) },
    { name: 'Section', render: d => renderText(d.section) },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getStatus(d.status)
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <Menu options={menuOptions} data={d} loading={actionLoader === d.woonboardingassetsId} />
        </div>
      ),
    },
  ]
  //
  const checkFilterDisability = () => {
    return isEmpty(selectedStatus) && isEmpty(selectedAssetClassCode) && isEmpty(selectedAssetClass) && isEmpty(selectedBuilding) && isEmpty(selectedFloor) && isEmpty(selectedRoom) && isEmpty(selectedSection)
  }
  const clearFilter = () => {
    setSelectedAssetClass({})
    setSelectedAssetClassCode({})
    setSelectedBuilding({})
    setSelectedFloor({})
    setSelectedRoom({})
    setSelectedSection({})
    setSelectedStatus({})
  }

  const downloadSample = () => {
    const link = document.createElement('a')
    link.href = isOnboarding ? URL.sampleOnboardingTemplate : URL.sampleInfraredScanTemplate
    link.click()
  }
  const handleUploadIrPhotos = () => {
    setError('')
    uploadIrPhotoRef.current && uploadIrPhotoRef.current.click()
  }
  const addIrPhotos = e => {
    e.preventDefault()
    if (!e.target.files.length) return
    const files = [...e.target.files]
    const invalidExtensions = files.map(d => ['jpg', 'jpeg', 'gif', 'png', 'eps'].includes(d.name.split('.').slice(-1).pop())).filter(d => d === false)
    if (!isEmpty(invalidExtensions)) setError('Invalid Image format !')
    else {
      setError('')
      uploadPhoto(files)
    }
    e.target.value = null
  }
  const showPhotos = photos => {
    const files = [...photos]
    files.forEach(d => {
      d.id = nanoid()
      d.url = window.URL.createObjectURL(d)
    })
    setUploadPreviewFiles(files)
    setTab(uploadTabs.UPLOADED)
  }
  const uploadPhoto = async files => {
    const formData = new FormData()
    files.forEach((file, i) => {
      formData.append(`file-${i}`, file, file.name)
    })
    formData.append('manual_wo_number', data.manualWoNumber)
    formData.append('wo_id', workOrderID)
    setUploading(true)
    try {
      const res = await onBoardingWorkorder.uploadIrPhoto(formData)
      if (res.success) {
        Toast.success('IR Images uploaded !')
        showPhotos(files)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading images !')
    }
    setUploading(false)
  }
  const closeOnUploadPopUp = () => {
    setUploadPreviewOpen(false)
    setTab(uploadTabs.UPLOAD)
    setUploadPreviewFiles([])
  }
  //
  const exportPDF = async () => {
    if (data.woStatusId === enums.woTaskStatus.Complete && !isEmpty(data.irWoPdfReport)) window.open(data.irWoPdfReport, '_blank')
    else if (
      !get(data, 'assetDetails', [])
        .map(d => d.status)
        .includes(enums.woTaskStatus.Complete)
    )
      Toast.error('No completed workorder line to export !')
    else generatePDF()
  }
  const generatePDF = async () => {
    setPdfProcessing(true)
    try {
      const res = await onBoardingWorkorder.pdf.generate(snakifyKeys({ woId: workOrderID }))
      if (res.success) {
        if (isEmpty(res.data.pdfS3Url)) checkPdfStatus()
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error exporting PDF !')
    }
  }
  const checkPdfStatus = async (timeoutCounter = 0) => {
    try {
      const counter = timeoutCounter
      const res = await onBoardingWorkorder.pdf.getStatus({ id: workOrderID })
      if (isEmpty(res.data.pdfReportUrl)) {
        if (counter < 42) setTimeout(() => checkPdfStatus(counter + 1), 5000)
        else {
          Toast.error('Request timed out. Please try again !')
          setPdfProcessing(false)
        }
      } else {
        window.open(res.data.pdfReportUrl, '_blank')
        setPdfProcessing(false)
      }
    } catch (error) {
      Toast.error('Error exporting PDF !')
    }
  }
  const viewTempIssue = async d => handleAction('VIEW', d)
  const checkIfReviewDisabled = () => {
    return isEmpty(data.assetDetails) || !data.assetDetails.some(row => row.status === enums.woTaskStatus.ReadyForReview) || data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress
  }
  //
  const dropDownMenuOptions = [
    { id: 3, type: 'button', text: 'Add Asset', disabled: data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress, onClick: () => setIsAddAssetPopupOpen(true), icon: <AddIcon fontSize='small' />, show: true, seperatorBelow: true },
    { id: 4, type: 'input', show: true, onChange: addAsset, ref: uploadAssetRef },
    { id: 1, type: 'button', text: 'Upload IR Photo', disabled: data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress, onClick: () => setUploadPreviewOpen(true), icon: <PublishOutlinedIcon fontSize='small' />, show: !isOnboarding },
    { id: 2, type: 'button', text: 'Upload Assets', disabled: data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress, onClick: handleUploadAsset, show: true, icon: <PublishOutlinedIcon fontSize='small' /> },
    { id: 5, type: 'input', show: true, onChange: addIrPhotos, ref: uploadIrPhotoRef, multiple: true },
    { id: 6, type: 'button', text: 'Download Sample File', onClick: downloadSample, icon: <GetAppOutlinedIcon fontSize='small' />, show: true, seperatorBelow: true },
    { id: 7, type: 'button', text: 'Export PDF', onClick: exportPDF, icon: <InsertDriveFileOutlinedIcon fontSize='small' />, show: !isOnboarding, disabled: IsCompletionInProgress || isEmpty(rows) },
  ]
  //
  const mainMenuOptions = [
    { id: 1, name: 'Edit', action: () => setIsEditWO(true), disabled: () => data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress },
    { id: 2, name: 'Review', action: () => setIsReviewOpen(true), disabled: () => checkIfReviewDisabled() },
  ]
  //check completeion status
  useEffect(() => {
    checkCompletionStatus()
  }, [])
  const checkCompletionStatus = async () => {
    if (isEmpty(window.location.pathname.split('/')[3])) return
    //console.log('check completion status')
    try {
      const res = await workorder.checkCompletionStatus(workOrderID)
      setCompletionProcessStatus(res.data.completeWoThreadStatus)
      //console.log(res.data)
      if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.IN_PROGRESS) setTimeout(() => checkCompletionStatus(), 5000)
      else if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.COMPLETED) reFetch()
      else if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.FAILED) Toast.error('Previous completion process failed !')
    } catch (error) {
      console.log(error)
    }
  }
  // add old/new asset
  const handleAddOldOrNewAsset = async () => {
    if (!addedAssetType) return handleAddNewAsset()
    else return handleAddExistingAsset()
  }
  const handleAddOldOrNewAssetPopupClose = () => {
    setIsAddAssetPopupOpen(false)
    setAddedAssetType(0)
  }
  const handleAddNewAsset = () => {
    setIsAddAssetPopupOpen(false)
    setIsAddOpen(true)
  }
  const handleAddExistingAsset = () => {
    setIsAddAssetPopupOpen(false)
    setIsAddExistingAssetOpen(true)
  }
  const handleCloseAdd = () => {
    setIsAddOpen(false)
    setAddedAssetType(0)
  }
  const checkOriginWoLineId = rows => {
    const query = new URLSearchParams(window.location.search)
    if (!isEmpty(query.get('originWoLineId')) && !originIssueOpened) {
      const d = rows.find(d => d.woonboardingassetsId === query.get('originWoLineId'))
      setOriginIssueOpened(true)
      handleAction('VIEW', d)
    }
  }
  const woState = {
    filter: get(history, 'location.state.filter', [[73, 13, 69]]),
    pageRows: get(history, 'location.state.pageRows', 20),
    search: get(history, 'location.state.search', ''),
    pageIndex: get(history, 'location.state.pageIndex', 1),
  }
  //
  const handleAddAssetInLocation = data => {
    setAddingAssetLocation(data)
    setIsAddAssetPopupOpen(true)
  }
  const aftersubmit = () => {
    reFetch()
    reFetchLocations()
  }

  useEffect(() => {
    const topLevel = rows.filter(d => d.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL)
    const subLevel = rows.filter(d => d.componentLevelTypeId === enums.COMPONENT_TYPE.SUB_COMPONENT)
    const noLevel = rows.filter(d => d.componentLevelTypeId === 0)
    const topLevelIds = []
    topLevel.forEach(d => {
      if (!isEmpty(d.assetId)) topLevelIds.push(d.assetId)
      if (!isEmpty(d.woonboardingassetsId)) topLevelIds.push(d.woonboardingassetsId)
    })
    const noTopLevelSub = subLevel.filter(sub => !topLevelIds.includes(sub.toplevelcomponentAssetId))
    setHierarchy(data => ({
      ...data,
      noLevel: [...noLevel, ...noTopLevelSub],
      isExpanded: false,
    }))
    const subLevelMapping = {}

    topLevel.forEach(top => {
      subLevelMapping[top.woonboardingassetsId] = subLevel.filter(sub => [top.woonboardingassetsId, top.assetId].includes(sub.toplevelcomponentAssetId) && !isEmpty(sub.toplevelcomponentAssetId))
    })

    const topLevelWithSubLevel = topLevel.map(top => ({
      ...top,
      subLevelComponent: subLevelMapping[top.woonboardingassetsId] || [],
      isExpanded: false,
    }))

    setHierarchy(data => ({
      ...data,
      topLevel: topLevelWithSubLevel,
      isExpanded: false,
    }))

    if (!isEmpty(searchString) || !isEmpty(selectedStatus) || !isEmpty(selectedAssetClassCode) || !isEmpty(selectedAssetClass) || !isEmpty(selectedBuilding) || !isEmpty(selectedFloor) || !isEmpty(selectedRoom) || !isEmpty(selectedSection)) {
      const allDataFilter = get(data, 'assetDetails', []).filter(d => d.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL)

      allDataFilter.forEach(top => {
        subLevelMapping[top.woonboardingassetsId] = subLevel.filter(sub => sub.toplevelcomponentAssetId === top.woonboardingassetsId)
      })

      const topLevelWithSubLevelFilter = allDataFilter.map(top => ({
        ...top,
        subLevelComponent: subLevelMapping[top.woonboardingassetsId] || [],
        isExpanded: true,
      }))
      const filterSub = topLevelWithSubLevelFilter.filter(d => d.subLevelComponent.length >= 1)

      setHierarchy(data => ({
        ...data,
        topLevel: isEmpty(filterSub) ? topLevelWithSubLevel : filterSub,
        isExpanded: !isEmpty(noLevel) ? true : false,
      }))
    }
  }, [rows, searchString])

  const handleSubExpand = (topAsset, e) => {
    e.stopPropagation()
    const topAssetList = [...hierarchy.topLevel]
    const noAssetList = [...hierarchy.noLevel]

    topAsset.isExpanded = !topAsset.isExpanded
    setHierarchy({ topLevel: topAssetList, noLevel: noAssetList })
  }

  const handleTechnician = () => {
    if (isEmpty(data)) return

    const maxVisibleTechnicians = 3
    const visibleTechnicians = isShowMore ? get(data, 'technicianMappingList', []) : data.technicianMappingList.slice(0, maxVisibleTechnicians)

    return (
      <>
        <div className='d-flex align-items-center flex-wrap'>
          {!isEmpty(visibleTechnicians)
            ? visibleTechnicians.map(d => (
                <div key={d.userId} className='ml-2 mb-2'>
                  <StatusComponent color='#848484' label={`${d.firstname} ${d.lastname}`} size='small' />
                </div>
              ))
            : 'N/A'}
        </div>
        {data.technicianMappingList.length > maxVisibleTechnicians && (
          <button className='readmore-button text-xs ml-2' onClick={() => setShowMore(!isShowMore)} style={{ color: '#778899' }}>
            {!isShowMore ? 'Show More' : 'Show less'}
          </button>
        )}
      </>
    )
  }

  const handleDueDateText = () => {
    return !isEmpty(get(data, 'dueDate', '')) ? (
      <span style={{ color: data.dueIn.includes('Overdue') ? 'red' : '' }} className={data.dueIn.includes('Overdue') ? 'text-bold' : ''}>
        {getFormatedDate(data.dueDate.split(' ')[0])} ({get(data, 'dueIn', '').trim()})
      </span>
    ) : (
      'N/A'
    )
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', padding: '20px', background: '#fff' }}>
      <CompletionStatus text='Workorder completion is still In Progress' status={completionProcessStatus} inProgress={enums.WO_COMPLETION_STATUS.IN_PROGRESS} />
      <div className='d-flex align-items-center mb-3 justify-content-between'>
        <div className='d-flex align-items-center'>
          <div className='mr-2'>
            <ActionButton action={() => history.push({ pathname: '/workorders', state: woState })} icon={<ArrowBackIcon fontSize='small' />} tooltip='GO BACK' />
          </div>
          <div className='text-bold mr-2 text-md'>{data.manualWoNumber}</div>
          <StatusComponent color={color} label={label} size='medium' />
        </div>
        <Menu options={mainMenuOptions} noToolip />
      </div>
      <div style={{ padding: '16px 32px', background: '#fafafa', borderRadius: '4px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {/* <LabelVal label='WO Number' value={data.manualWoNumber} inline /> */}
          {!loading && <LabelVal label='Work Type' value={get(data, 'woTypeName', '')} inline />}
          {!loading && <LabelVal label='Start Date' value={data.startDate ? getFormatedDate(data.startDate.split('T')[0]) : 'N/A'} inline />}
          <LabelVal label='Due Date' value={handleDueDateText()} inline />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
          <div className='mr-1'>{!loading && <LabelVal label='Description' value={renderDescription()} inline lableMinWidth={85} />}</div>
          <LabelVal inline label='Assigned  Technicians' value={handleTechnician()} lableMinWidth={85} />

          {/* <LabelVal label='Enterprise' value={data.clientCompanyName} inline /> */}
        </div>

        {/* <LabelVal label='Facility' value={data.siteName} inline /> */}
      </div>
      <div className='d-flex flex-row justify-content-between align-items-center mt-3' style={{ width: '100%' }}>
        <div className='d-flex align-items-center'>
          <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} />
          {!isEmpty(error) && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{error}</span>}
          {pdfProcessing && (
            <div className='d-flex align-items-center ml-3'>
              <CircularProgress size={20} thickness={5} />
              <div className='ml-2 text-bold'>Generating PDF...</div>
            </div>
          )}
        </div>
        {/* <div className='d-flex align-items-center'>
          <div></div>
          <SearchComponent searchString={searchString} setSearchString={setSearchString} />
        </div> */}
      </div>

      {/* tabs */}
      <div className='assets-box-wraps customtab'>
        <AppBar position='static' color='inherit'>
          <Tabs id='controlled-tab-example' activeKey={mainTab} onSelect={k => setMainTab(k)}>
            <Tab eventKey='DEFAULT' title={`Default`} tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='LOCATIONS' title={`Locations`} tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='NEW_ISSUES' title='Issues' tabClassName='font-weight-bolder small-tab'></Tab>
          </Tabs>
        </AppBar>
      </div>

      {mainTab === 'DEFAULT' && (
        <>
          <div className='d-flex flex-row justify-content-between align-items-center my-2' style={{ width: '100%' }}>
            <div className='d-flex flex-wrap mt-2'>
              <FilterPopup selected={selectedAssetClassCode} onChange={d => setSelectedAssetClassCode(d)} onClear={() => setSelectedAssetClassCode({})} placeholder='Asset Class Code' options={assetClassCodeOptions} baseClassName='mr-2 mb-2' />
              <FilterPopup selected={selectedAssetClass} onChange={d => setSelectedAssetClass(d)} onClear={() => setSelectedAssetClass({})} placeholder='Asset Class' options={assetClassOptions} baseClassName='mr-2 mb-2' />
              <FilterPopup selected={selectedBuilding} onChange={d => setSelectedBuilding(d)} onClear={() => setSelectedBuilding({})} placeholder='Building' options={buildingOptions} baseClassName='mr-2 mb-2' />
              <FilterPopup selected={selectedFloor} onChange={d => setSelectedFloor(d)} onClear={() => setSelectedFloor({})} placeholder='Floor' options={floorOptions} baseClassName='mr-2 mb-2' />
              <FilterPopup selected={selectedRoom} onChange={d => setSelectedRoom(d)} onClear={() => setSelectedRoom({})} placeholder='Room' options={roomOptions} baseClassName='mr-2 mb-2' />
              <FilterPopup selected={selectedSection} onChange={d => setSelectedSection(d)} onClear={() => setSelectedSection({})} placeholder='Section' options={sectionOptions} baseClassName='mr-2 mb-2' />
              <FilterPopup selected={selectedStatus} onChange={d => setSelectedStatus(d)} onClear={() => setSelectedStatus({})} placeholder='Status' options={statusOptions} baseClassName='mr-2 mb-2' />
            </div>
            <div className='d-flex mt-2' style={{ minWidth: '333px' }}>
              <SearchComponent searchString={searchString} setSearchString={setSearchString} />
              <MinimalButton size='small' disabled={checkFilterDisability()} startIcon={<RotateLeftSharpIcon />} text='Clear Filters' onClick={clearFilter} variant='contained' color='primary' baseClassName='mr-3' />
            </div>
          </div>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `calc(100% - 345px)` }}>
            {/* <TopSubTableHeader columns={columns} /> */}
            <TopSubTableComponent data={hierarchy} columns={columns} onRowClick={d => handleAction('VIEW', d)} isForViewAction={true} loading={loading} />
          </div>
        </>
      )}
      {mainTab === 'NEW_ISSUES' && <NewIssues viewTempIssue={viewTempIssue} woId={workOrderID} searchString={searchString} />}
      {mainTab === 'LOCATIONS' && (
        <Locations rows={rows} actionLoader={actionLoader} viewAsset={d => handleAction('VIEW', d)} woId={workOrderID} searchString={searchString} data={data} handleAddAssetInLocation={handleAddAssetInLocation} setTempBuildings={setTempBuildings} isAddDisabled={data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress} />
      )}

      <div className='d-flex row-reverse justify-content-end my-2 sticky-bottom-btn'>
        <div className='d-flex align-items-center' style={getEnableStatus() ? { cursor: 'not-allowed', color: 'grey' } : {}}>
          <div style={{ fontWeight: 800, marginRight: '5px', color: getEnableStatus() ? '#00000075' : '#000' }}>Override</div>
          <Checkbox checked={isOverride} disabled={getEnableStatus()} onChange={e => setOverride(e.target.checked)} name='checkedB' color='primary' size='small' style={{ padding: '2px' }} />
        </div>
        <MinimalButton text='Complete Workorder' loadingText='Completing...' variant='contained' color='primary' baseClassName='mx-2' onClick={() => setIsCompleteOpen(true)} disabled={checkCompWOEnableStatus()} />
      </div>
      {isViewOpen && <View isOnboarding={isOnboarding} viewObj={actionObj} open={isViewOpen} onClose={() => setIsViewOpen(false)} />}
      {isEditOpen && <Edit isOnboarding={isOnboarding} viewObj={actionObj} open={isEditOpen} onClose={() => setIsEditOpen(false)} afterSubmit={aftersubmit} classCodeOptions={classCodeOptions} workOrderID={workOrderID} workOrderNumber={data.manualWoNumber} buildingOptions={tempBuildings} />}
      {isAddOpen && <Edit isOnboarding={isOnboarding} viewObj={{}} open={isAddOpen} onClose={handleCloseAdd} afterSubmit={aftersubmit} isNew classCodeOptions={classCodeOptions} workOrderID={workOrderID} workOrderNumber={data.manualWoNumber} buildingOptions={tempBuildings} fixedLocations={addingAssetLocation} />}
      {isEditWO && <EditWO obj={snakifyKeys(data)} open={isEditWO} onClose={() => setIsEditWO(false)} afterSubmit={aftersubmit} />}

      <DialogPrompt title='Complete Work Order' text='Are you sure you want to complete Work Order ? Work order lines with Open status would be deleted' actionLoader={woCompLoading} open={isCompleteOpen} ctaText='Complete' action={completeWO} handleClose={() => setIsCompleteOpen(false)} />
      <DialogPrompt title='Remove Asset' text='Are you sure you want to remove the asset from Work Order?' actionLoader={deleteLoading} open={isDeleteOpen} ctaText='Remove' action={deleteAsset} handleClose={() => setIsDeleteOpen(false)} />
      {isRejectOpen && (
        <PopupModal open={isRejectOpen} onClose={closeRejectReasonModal} title='Reject Asset' loading={rejectLoading} handleSubmit={rejectAsset}>
          <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
        </PopupModal>
      )}
      {uploadPreviewOpen && <UploadIrPhotos open={uploadPreviewOpen} onClose={closeOnUploadPopUp} workOrderID={workOrderID} manualWoNumber={data.manualWoNumber} />}
      {/* REVIEW MWO LINES */}
      {isReviewOpen && <Review workOrderID={workOrderID} open={isReviewOpen} onClose={() => setIsReviewOpen(false)} data={data.assetDetails} classCodeOptions={classCodeOptions} afterSubmit={aftersubmit} />}
      {/* ADD OLD/NEW ASSET */}
      {isAddAssetPopupOpen && (
        <PopupModal open={isAddAssetPopupOpen} onClose={handleAddOldOrNewAssetPopupClose} cta='Add' title='Add Asset' handleSubmit={handleAddOldOrNewAsset}>
          <MinimalButtonGroup label='Select Asset Type' value={addedAssetType} onChange={value => setAddedAssetType(value)} options={addedAssetTypeOptions} w={100} baseStyles={{ marginRight: 0 }} />
        </PopupModal>
      )}
      {isAddExistingAssetOpen && <AddExistingAsset setAddingAssetLocation={setAddingAssetLocation} locations={addingAssetLocation} workOrderID={workOrderID} open={isAddExistingAssetOpen} onClose={() => setIsAddExistingAssetOpen(false)} data={data} afterSubmit={aftersubmit} />}
    </div>
  )
}

export default OnBoardingWorkOrder

import React, { useState, useEffect, useRef } from 'react'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'
import _, { size } from 'lodash'
import viewWorkOrderDetailsById from '../../Services/WorkOrder/viewWorkOrderDetailsById'
import $ from 'jquery'
import AssignTechinican from './AssignTechinican'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import uploadWOAttachment from '../../Services/WorkOrder/uploadWOAttachment'
import mapWOAttachment from '../../Services/WorkOrder/mapWOAttachment'
import deleteWOAttachment from '../../Services/WorkOrder/deleteWOAttachment'
import deleteWOCategory from '../../Services/WorkOrder/deleteWOCategory'
import updateCategoryStatus from '../../Services/WorkOrder/updateCategoryStatus'
import updateWOStatus from '../../Services/WorkOrder/updateWOStatus'
import uploadQuote from '../../Services/WorkOrder/uploadQuote'
import { Toast } from '../../Snackbar/useToast'
import DialogPrompt from '../DialogPrompt'
import { getDateTime, getFormatedDate } from 'helpers/getDateTime'
import EditWO from './EditWO'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import enums from '../../Constants/enums'
import WOCategoryView from './WOCategoryView'
import XLSX from 'xlsx'
import * as yup from 'yup'
import exportPDF from './exportPDF.js'
import GridView from './grid-view'
import getFormJson from 'Services/FormIO/get-form-json'
import TaskList from './view-tasks/task-list'
import URL from 'Constants/apiUrls'
import { AppBar } from '@material-ui/core'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import SearchComponent from 'components/common/search'
import AddAssetClass from 'components/WorkOrders/add-asset-class'
import AssignAsset from 'components/WorkOrders/assign-asset'
import { StatusComponent, LabelVal, Menu, PopupModal, MinimalRadio, DropDownMenu, ToggleButton } from 'components/common/others'
import { MinimalTextArea, MinimalInput } from 'components/Assets/components'

import { getStatus } from 'components/WorkOrders/onboarding/utils'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { TableComponent } from 'components/common/table-components'
import workorder from 'Services/WorkOrder/common'
import exportWorkOrderPDF from 'Services/WorkOrder/exportWorkOrderPDF'
import Repair from 'components/WorkOrders/maintenance-forms/repair'
import Issue from 'components/WorkOrders/maintenance-forms/Issue'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import updateWOCategoryTaskStatus from 'Services/WorkOrder/updateWOCategoryTaskStatus'
import View from 'components/WorkOrders/maintenance-forms/view'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import Edit from 'components/WorkOrders/onboarding/edit'
import useFetchData from 'hooks/fetch-data'
import assetClass from 'Services/WorkOrder/asset-class'
import * as assetFormClass from 'Services/FormIO/asset-class'
import { isEmpty, get } from 'lodash'
import ViewOB from 'components/WorkOrders/onboarding/view'
import AssetWise from 'components/WorkOrders/maintenance-forms/asset-wise'
import CreateNewAsset from 'components/WorkOrders/maintenance-forms/create-new-asset'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import PlayForWorkOutlinedIcon from '@material-ui/icons/PlayForWorkOutlined'
import NewIssues from 'components/WorkOrders/issues'
import LinkFixIssues from 'components/WorkOrders/issues/link-fix-issues'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { history } from 'helpers/history'
import LinkPMs from 'components/preventative-maintenance/work-order/link-pms'
import { CompletionStatus } from 'components/WorkOrders/components'
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined'
import { bulkExport } from 'components/WorkOrders/spreadsheet/export-bulk'
import { bulkImport } from 'components/WorkOrders/spreadsheet/import-bulk'
import ReviewLines from 'components/WorkOrders/maintenance-forms/review-lines'
import equipments from 'Services/equipments'
import preventativeMaintenance from 'Services/preventative-maintenance'
import AddPM from 'components/preventative-maintenance/work-order/add-pms'
import ViewForm from 'components/preventative-maintenance/forms/view-form'
import EditForm from 'components/preventative-maintenance/forms/edit-form'
import ThermographyForm from 'components/preventative-maintenance/forms/thermography-form'
import UploadIrPhotos from 'components/WorkOrders/onboarding/upload-ir-photos'
import Install from 'components/WorkOrders/maintenance-forms/install'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import AccessTimeOutlinedIcon from '@material-ui/icons/AccessTimeOutlined'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import UpdateOutlinedIcon from '@material-ui/icons/UpdateOutlined'
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined'

function AcceptanceTWO({ workOrderID }) {
  const [woDetails, setWoDetails] = useState({})
  const [categories, setCategories] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewLineOpen, setIsViewLineOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [reload, setReload] = useState(0)
  const [anchorObj, setAnchorObj] = useState({})
  const [delObj, setDelObj] = useState({})
  const [assignAssetOpen, setIsAssignAssetOpen] = useState(false)
  const [assignTechOpen, setIsAssignTechOpen] = useState(false)
  const [isDescLarge, setIsDescLarge] = useState(false)
  const [isReadMore, setReadMore] = useState(false)
  const [isDeleteAttOpen, setDeleteAttOpen] = useState(false)
  const [isGridViewOpen, setGridViewOpen] = useState(false)
  const uploadInputRef = useRef(null)
  const uploadQuoteRef = useRef(null)
  const uploadBulkRef = useRef(null)
  const [isOverride, setOverride] = useState(false)
  const [isCompleteWOEnable, setIsCompleteWOEnable] = useState(false)
  const [woCompLoading, setWOCompLoading] = useState(false)
  const [delCatOpen, setDelCatOpen] = useState(false)
  const [holdCatOpen, setHoldCatOpen] = useState(false)
  const [editWOOpen, setEditWOOpen] = useState(false)
  const [woDetailAnchorEl, setWODetailAnchorEl] = useState(null)
  const [isShowAllViewTask, setIsShowAllViewTask] = useState(false)
  const [fetchingForm, setFetchingForm] = useState(false)
  const [error, setError] = useState({})
  const { color, label } = getStatus(woDetails.wo_status_id)
  const isAcceptanceWO = woDetails.wo_type === enums.woType.Acceptance
  const [exportLoading, setExportLoading] = useState(false)
  const [viewAllTaskLoading, setViewAllTaskLoading] = useState(false)
  const [masterForms, setMasterForms] = useState([])
  const [searchString, setSearchString] = useState('')
  const [rows, setRows] = useState([])
  const [isAddNewLineOpen, setAddNewLineOpen] = useState(false)
  const [selectedInspectionType, setSelectedInspectionType] = useState(enums.MWO_INSPECTION_TYPES.INSPECTION)
  const inspectionTypes = [
    { label: 'Inspection', value: enums.MWO_INSPECTION_TYPES.INSPECTION },
    { label: 'Install / Add', value: enums.MWO_INSPECTION_TYPES.INSTALL },
    { label: 'Repair', value: enums.MWO_INSPECTION_TYPES.REPAIR },
    { label: 'Replace', value: enums.MWO_INSPECTION_TYPES.REPLACE },
    { label: 'General Issue Resolution', value: enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK },
    { label: 'Issue', value: enums.MWO_INSPECTION_TYPES.ISSUE },
    { label: 'Preventative Maintenance', value: enums.MWO_INSPECTION_TYPES.PM },
  ]
  const [isRepairOpen, setRepairOpen] = useState(false)
  const [isIssueOpen, setIssueOpen] = useState(false)
  const [isReplaceOpen, setReplaceOpen] = useState(false)
  const [isTroblecallCheckOpen, setTroblecallCheckOpen] = useState(false)
  const [isObOpen, setObOpen] = useState(false)
  const [isViewRepairOpen, setIsViewRepairOpen] = useState(false)
  const [isViewRepairObOpen, setIsViewRepairObOpen] = useState(false)
  const [editWorkOrderLine, setEditWorkOrderLine] = useState({ open: false, isRepair: false, isInspection: false, isTroubleCall: false, isOnboarding: false })
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  const [inspectionTypeIsEdit, setIinspectionTypeIsEdit] = useState(false)
  const [selectedTab, setTab] = useState(get(history, 'location.state.tab', 'DEFAULT') || 'DEFAULT')
  const [isCreateNewMwAssetOpen, setCreateNewMwAssetOpen] = useState(false)
  //
  const [isUpdateGroupOpen, setUpdateGroupOpen] = useState(false)
  const [updateGroupObj, setUpdateGroupObj] = useState({})
  const [updateGroupString, setUpdateGroupString] = useState('')
  const [isUpdateGroupLoading, setUpdateGroupLoading] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isReviewDisable, setIsReviewDisable] = useState(false)
  const [itHaveMoreType, setItHaveMoreType] = useState(false)

  const [linkFixIssueOpen, setLinkFixIssueOpen] = useState(false)
  const [issueLoading, setIssueLoading] = useState('')

  const [isSpreadSheetOpen, setSpreadSheetOpen] = useState(false)
  const [isLinkPmOpen, setLinkPmOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)

  const [completionProcessStatus, setCompletionProcessStatus] = useState(null)
  const [bulkUploadProcessStatus, setBulkUploadProcessStatus] = useState(null)
  const [isFailedPopUpOpen, setFailedPopUpOpen] = useState(false)
  const [failedAssets, setFailedAssets] = useState([])
  const IsCompletionInProgress = completionProcessStatus === enums.WO_COMPLETION_STATUS.IN_PROGRESS
  const [isReviewLinesOpen, setReviewLinesOpen] = useState(false)
  const [originIssueOpened, setOriginIssueOpened] = useState(false)

  const [isAddPmOpen, setAddPmOpen] = useState(false)
  const [isViewPmOpen, setViewPmOpen] = useState(false)
  const [isEditPmOpen, setEditPmOpen] = useState(false)
  const [isViewThermographyOpen, setViewThermographyOpen] = useState(false)
  const [isEditThermographyOpen, setEditThermographyOpen] = useState(false)
  const [uploadPreviewOpen, setUploadPreviewOpen] = useState(false)
  const uploadIrPhotoRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [anyPmList, setAnyPmList] = useState([])
  const [currentPmIndex, setCurrentPmIndex] = useState(0)
  const [showSkipInPm, setShowSkipInPm] = useState(false)
  const [subTab, setSubTab] = useState('DEFAULT')
  const [isShowMore, setShowMore] = useState(false)
  //
  const sortClassCodes = d => {
    const list = _.get(d, 'data', {})
    list.forEach(d => {
      d.id = d.value
      d.value = d.className
    })
    const sortedList = _.orderBy(list, [d => d.label && d.label.toLowerCase()], 'asc')
    return sortedList
  }
  const { data: classCodeOptions } = useFetchData({ fetch: assetClass.getAllAssetClassCodes, formatter: d => sortClassCodes(d) })
  const payload = { pageSize: 0, pageIndex: 0, siteId: localStorage.getItem('siteId'), searchString: '', equipmentNumber: [], manufacturer: [], modelNumber: [], calibrationStatus: [] }
  const { data: equipmentListOptions } = useFetchData({ fetch: equipments.getAllEquipmentList, payload, formatter: d => _.get(d, 'data.list', []) })
  //
  useEffect(() => {
    ;(async () => {
      $('#pageLoading').show()
      try {
        const details = await viewWorkOrderDetailsById(workOrderID)
        // console.log(details.data)
        setWoDetails(details.data)
        var arrStatus = []
        if (details.data.wo_type === enums.woType.Acceptance) {
          const rows = _.orderBy([...details.data.form_category_list], [d => d.group_string && d.group_string.toLowerCase()], ['asc'])
          const isReviewVisible = _.isEmpty(rows) || !rows.some(row => row.status_id === enums.woTaskStatus.ReadyForReview)
          setIsReviewDisable(isReviewVisible)
          setCategories(rows)
          setRows(rows)
          arrStatus = rows
        } else if (details.data.wo_type === enums.woType.Maintainance) {
          const _tasks = _.get(details, 'data.wo_all_tasks', [])
          const ob = _.get(details, 'data.mwo_ob_assets', []) || []
          const mwoba = ob.map(d => ({ ...d, wo_inspectionsTemplateFormIOAssignment_id: d.woonboardingassets_id, assigned_asset_name: d.asset_name, status_id: d.status }))
          arrStatus = [..._tasks, ...mwoba]
          if (arrStatus.length > 0) {
            const itHaveMoreType = arrStatus.filter(d => [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(d.status_id) && d.inspection_type === enums.MWO_INSPECTION_TYPES.INSPECTION)
            setItHaveMoreType(_.isEmpty(itHaveMoreType))
          } else {
            setItHaveMoreType(true)
          }
          const isReviewVisible = _.isEmpty(arrStatus) || !arrStatus.some(row => row.status_id === enums.woTaskStatus.ReadyForReview) || details.data.wo_status_id === enums.woTaskStatus.Complete || IsCompletionInProgress
          setIsReviewDisable(isReviewVisible)
          setTasks([..._tasks, ...mwoba])
          setRows([..._tasks, ...mwoba])
          checkOriginWoLineId([..._tasks, ...mwoba])
        }
        if (details.data.description && details.data.description.length > 25) setIsDescLarge(true)
        const statusArr = arrStatus.map(e => e.status_id)
        const mappedStatus = [...new Set(statusArr)].map(d => [15, 75].includes(d))
        if ([...new Set(mappedStatus)].length === 1 && [...new Set(mappedStatus)][0]) setIsCompleteWOEnable(true)
        else setIsCompleteWOEnable(false)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setCategories([])
        setLoading(false)
      }
      $('#pageLoading').hide()
    })()
  }, [reload])

  const handleAction = async (type, obj, e) => {
    if (type === 'NEW' && isAcceptanceWO) setIsCreateOpen(true)
    if (type === 'NEW' && !isAcceptanceWO) setAddNewLineOpen(true)
    if (type === 'EXPORT') exportPDF({ wo: obj, woDetails })
    if (type === 'DELETE') {
      if (woDetails.wo_status_id === 15) return
      setDelObj(obj)
      setDeleteAttOpen(true)
    }
    if (type === 'EDIT') {
      setWODetailAnchorEl(null)
      setEditWOOpen(true)
    }
  }
  const getLineType = type => {
    return {
      isRepair: type === enums.MWO_INSPECTION_TYPES.REPAIR,
      isInspection: type === enums.MWO_INSPECTION_TYPES.INSPECTION,
      isReplace: type === enums.MWO_INSPECTION_TYPES.REPLACE,
      isTroubleCall: type === enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK,
      isOnboarding: type === enums.MWO_INSPECTION_TYPES.INSTALL,
    }
  }
  const handleDeleteAssetLine = obj => {
    setAnchorObj(obj)
    setDelCatOpen(true)
  }
  const editInspectionForm = () => {
    setIinspectionTypeIsEdit(true)
    setIsViewOpen(true)
  }
  const viewInspectionForm = () => {
    setIinspectionTypeIsEdit(false)
    setIsViewOpen(true)
  }
  const handleSubAction = async (type, obj) => {
    if (type === 'DEL') return handleDeleteAssetLine(obj)
    if (type === 'LINK_PM') return linkPM(obj)
    else if (['ACCEPT_MW', 'HOLD_MW'].includes(type)) return updateAssetStatusAction({ wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMapping_id, woonboardingassetsId: obj.wo_inspectionsTemplateFormIOAssignment_id, status: type }, obj)
    else if (type === 'REJECT_MW') return rejectAssetAction({ woonboardingassetsId: obj.woonboardingassets_id, wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMapping_id }, obj)
    else if (type === 'LINK_ISSUE') return linkFixIssue(obj)
    else {
      const isRepairReplace = [enums.MWO_INSPECTION_TYPES.REPAIR, enums.MWO_INSPECTION_TYPES.REPLACE, enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK, enums.MWO_INSPECTION_TYPES.INSTALL].includes(obj.inspection_type)
      setFetchingForm(obj.wo_inspectionsTemplateFormIOAssignment_id)
      const form_data = isAcceptanceWO ? await fetchFormJSON(obj) : isRepairReplace ? await onBoardingWorkorder.getAssetDetail({ id: obj.woonboardingassets_id }) : obj.inspection_type === enums.MWO_INSPECTION_TYPES.PM ? await fetchPmFormJSON(obj) : await fetchFormJSON(obj)
      const anchor = isAcceptanceWO || obj.inspection_type === enums.MWO_INSPECTION_TYPES.INSPECTION ? { ...obj, form_data } : obj.inspection_type === enums.MWO_INSPECTION_TYPES.INSTALL ? { ...obj, ...form_data.data } : { ...obj, form_data }
      setAnchorObj(anchor)
      setFetchingForm(false)
      if (type === 'ASSET') setIsAssignAssetOpen(true)
      if (type === 'TECH') setIsAssignTechOpen(true)
      if (type === 'GRID') setGridViewOpen(true)
      if (type === 'SPREADSHEET') setSpreadSheetOpen(true)
      if (type === 'VIEWLINE') {
        setIsViewLineOpen(true)
        setIsShowAllViewTask(false)
      }
      if (type === 'HOLD') setHoldCatOpen(true)
      //new mwo actions
      const editObjx = getLineType(obj.inspection_type)
      if (type === 'VIEW') {
        if (isRepairReplace) {
          if (obj.inspection_type === enums.MWO_INSPECTION_TYPES.INSTALL) setIsViewRepairObOpen(true)
          else setIsViewRepairOpen(true)
        } else if (obj.inspection_type === enums.MWO_INSPECTION_TYPES.PM) {
          if (!_.isEmpty(form_data)) {
            setShowSkipInPm(obj.can_be_skipped)
            setAnchorObj({ ...form_data, obj })
            obj.pm_inspection_type_id === 1 ? setViewThermographyOpen(true) : setViewPmOpen(true)
          }
        } else viewInspectionForm()
      }
      if (type === 'EDIT_MW') {
        if (isRepairReplace) setEditWorkOrderLine({ ...editObjx, open: true })
        else if (obj.inspection_type === enums.MWO_INSPECTION_TYPES.PM) {
          if (!_.isEmpty(form_data)) {
            setShowSkipInPm(obj.can_be_skipped)
            setAnchorObj({ ...form_data, obj: { ...obj, manual_wo_number: woDetails.manual_wo_number } })
            obj.pm_inspection_type_id === 1 ? setEditThermographyOpen(true) : setEditPmOpen(true)
          }
        } else editInspectionForm()
      }
    }
  }
  const fetchFormJSON = async obj => {
    try {
      setFetchingForm(obj.wo_inspectionsTemplateFormIOAssignment_id)
      const res = await getFormJson({ form_id: obj.form_id, asset_form_id: null })
      setFetchingForm(false)
      if (res.success) return res.data.asset_form_data
    } catch (error) {
      console.log(error)
      setFetchingForm(false)
    }
  }
  const fetchPmFormJSON = async obj => {
    try {
      setFetchingForm(obj.wo_inspectionsTemplateFormIOAssignment_id)
      const res = await preventativeMaintenance.forms.getLine({ asset_pm_id: _.get(obj, 'asset_pm_id', null), temp_asset_pm_id: _.get(obj, 'temp_asset_pm_id', null), woonboardingassets_id: obj.woonboardingassets_id })
      if (obj.pm_inspection_type_id === 1) {
        const submissionData = JSON.parse(_.get(res.data, 'pmFormOutputData', '{}'))
        return { submissionData }
      } else if (res.success > 0) {
        const data = JSON.parse(_.get(res.data, 'formJson', '{}'))
        const submissionData = JSON.parse(_.get(res.data, 'pmFormOutputData', '{}'))
        return { data, submissionData }
      } else Toast.error(res.message || 'Error fetching info. Please try again !')
    } catch (error) {
      console.log(error)
      Toast.error('Error fetching info. Please try again !')
      setFetchingForm(false)
    }
  }
  const addAttachment = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    uploadAttachment(file)
    e.target.value = null
  }
  const uploadAttachment = async file => {
    $('#pageLoading').show()
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await uploadWOAttachment(formData)
      if (res.success > 0) mapAttachment(res.data)
      else Toast.error('Error uploading file. Please try again !')
    } catch (error) {
      Toast.error('Error uploading file. Please try again !')
      $('#pageLoading').hide()
    }
  }
  const delCategory = async () => {
    setDelCatOpen(false)
    $('#pageLoading').show()
    const isInspection = enums.MWO_INSPECTION_TYPES.INSPECTION === anchorObj.inspection_type
    try {
      const res = isAcceptanceWO
        ? await deleteWOCategory({ wo_inspectionsTemplateFormIOAssignment_id: anchorObj.wo_inspectionsTemplateFormIOAssignment_id })
        : !isInspection
        ? await onBoardingWorkorder.deleteAsset({ woonboardingassets_id: anchorObj.woonboardingassets_id })
        : await deleteWOCategory({ wo_inspectionsTemplateFormIOAssignment_id: anchorObj.wo_inspectionsTemplateFormIOAssignment_id })
      if (res.success > 0) Toast.success(`${isAcceptanceWO ? 'Class' : 'Line'} Removed Successfully !`)
      else {
        const msg = isEmpty(res.message) ? `Error removing ${isAcceptanceWO ? 'class' : 'Line'}. Please try again !` : res.message
        Toast.error(msg)
      }
    } catch (error) {
      Toast.error(`Error removing ${isAcceptanceWO ? 'class' : 'Line'}. Please try again !`)
    }
    setReload(p => p + 1)
  }
  const mapAttachment = async data => {
    try {
      const res = await mapWOAttachment({
        wo_id: workOrderID,
        file_name: data.filename,
        user_uploaded_name: data.user_uploaded_name,
      })
      if (res.success > 0) Toast.success('File Uploaded Successfully !')
      else Toast.error('Error uploading file. Please try again !')
    } catch (error) {
      Toast.error('Error uploading file. Please try again !')
    }
    setReload(p => p + 1)
  }
  const checkCompWOEnableStatus = () => {
    if (woCompLoading) return true
    if (IsCompletionInProgress) return true
    else if (woDetails.wo_status_id === 15) return true
    else if (isOverride || isCompleteWOEnable) return false
    else return true
  }
  const completeWO = async () => {
    let isDataNotExist = false
    if (woDetails.wo_type === enums.woType.Acceptance) {
      isDataNotExist = (categories != null && categories.length) > 0 ? false : true
    } else {
      isDataNotExist = tasks != null && tasks.length > 0 ? false : true
    }

    if (isDataNotExist && woDetails.wo_type === enums.woType.Acceptance) {
      Toast.error('Category should not be blank!')
    } else if (isDataNotExist && woDetails.wo_type === enums.woType.Maintainance) {
      Toast.error('Tasks should not be blank!')
    } else {
      setWOCompLoading(true)
      $('#pageLoading').show()
      try {
        const res = await updateWOStatus({ wo_id: woDetails.wo_id, status: 15 })
        if (res.success > 0) {
          Toast.success('Workorder completion started !')
          setCompletionProcessStatus(enums.WO_COMPLETION_STATUS.IN_PROGRESS)
        } else Toast.error(res.message)
      } catch (error) {
        Toast.error('Error completing workorder. Please try again !')
      }
      setWOCompLoading(false)
      setIsCompleteOpen(false)
      setReload(p => p + 1)
      checkCompletionStatus()
    }
  }
  const delAttachment = async () => {
    setDeleteAttOpen(false)
    $('#pageLoading').show()
    try {
      const res = await deleteWOAttachment({ wo_attachment_id: delObj.wo_attachment_id })
      if (res.success > 0) Toast.success('Attachment Removed Successfully !')
      else Toast.error('Error removing attachment. Please try again !')
    } catch (error) {
      Toast.error('Error removing attachment. Please try again !')
    }
    setReload(p => p + 1)
  }
  const holdCategory = async () => {
    setHoldCatOpen(false)
    $('#pageLoading').show()
    try {
      const res = await updateCategoryStatus({ wo_inspectionsTemplateFormIOAssignment_id: anchorObj.wo_inspectionsTemplateFormIOAssignment_id, status: 69 })
      if (res.success > 0) Toast.success(`${isAcceptanceWO ? 'class' : 'asset'} Put to Hold Successfully !`)
      else Toast.error(`Error putting hold ${isAcceptanceWO ? 'class' : 'asset'}. Please try again !`)
    } catch (error) {
      Toast.error(`Error putting hold ${isAcceptanceWO ? 'class' : 'asset'}. Please try again !`)
    }
    setReload(p => p + 1)
  }
  const closeViewLine = () => {
    setIsViewLineOpen(false)
    setReload(p => p + 1)
    setIsShowAllViewTask(false)
  }
  const closeReviewLine = () => {
    setIsReviewOpen(false)
    setReload(p => p + 1)
    setIsShowAllViewTask(false)
  }
  const showAllViewTask = async type => {
    try {
      setViewAllTaskLoading(true)
      const { data } = await exportWorkOrderPDF(workOrderID)
      setMasterForms(_.get(data, 'master_forms', []))
      setViewAllTaskLoading(false)
    } catch (error) {}
    setAnchorObj(woDetails)
    setWODetailAnchorEl(null)
    setIsShowAllViewTask(true)
    type === 'View' ? setIsViewLineOpen(true) : setIsReviewOpen(true)
    // setIsViewLineOpen(true)
  }
  const closeView = () => {
    setIsViewOpen(false)
    setReload(p => p + 1)
  }
  const handleUploadQuote = () => {
    setError('')
    uploadQuoteRef.current && uploadQuoteRef.current.click()
  }
  const addQuote = e => {
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
  const makeUniqueArray = val => [...new Set(val.map(s => JSON.stringify(s)))].map(k => JSON.parse(k))
  const parseAsString = val => (!_.isEmpty(val) && val !== 'undefined' ? `${val}`.trim() : null)
  const parseAsEmptyString = val => (!_.isEmpty(val) && val !== 'undefined' ? `${val}`.trim() : '')

  const validateSheet = async data => {
    const schema = yup.array().of(
      yup.object().shape({
        location: yup.string().required('Location is required'),
        identification: yup.string().required('Equipment Identification is required'),
        //type: yup.string().required('Equipment Type is required'),
        asset_class_code: yup.string().required('Asset Class Code is required'),
      })
    )
    const payload = data.map(d => ({
      location: parseAsEmptyString(d['Zone (location)']),
      identification: parseAsEmptyString(d['Equipment Identification']),
      //type: parseAsEmptyString(d['Equipment Type']) || parseAsEmptyString(d['Type']),
      asset_class_code: parseAsEmptyString(d['Asset Class Code']),
      building: parseAsString(`${d['Building']}`),
      floor: parseAsString(`${d['Floor']}`),
      room: parseAsString(`${d['Room']}`),
      section: parseAsString(`${d['Section']}`),
      note: parseAsString(d['Note']),
    }))
    try {
      await schema.validate(payload, { abortEarly: false })
      const payload2 = makeUniqueArray(payload)
      const unqiFormNType = _.uniqBy(payload2, v => v.asset_class_code).map(({ asset_class_code }) => ({ asset_class_code }))
      const categoryList = []
      unqiFormNType.forEach(tf => {
        const l = payload2.filter(d => d.asset_class_code === tf.asset_class_code)
        categoryList.push({
          //category_type: tf.type,
          asset_class_code: tf.asset_class_code,
          category_task_list: l.map(({ identification, location, floor, room, building, section, note }) => ({ identification, location, floor, room, building, section, note })),
        })
      })
      // console.log(categoryList)
      uploadQuoteData({ wo_id: workOrderID, category_list: categoryList })
      setError('')
    } catch (error) {
      const lineNo = Number(error.inner[0].path.split('.')[0].match(/\[(.*?)\]/)[1])
      setError(`${error.inner[0].message} on Line [${lineNo + 2}]`)
    }
  }
  const uploadQuoteData = async data => {
    try {
      const res = await uploadQuote(data)
      if (res.success > 0) Toast.success(`Quote uploaded Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error uploading Quote. Please try again !`)
    }
    setReload(p => p + 1)
  }
  const getEnableStatus = () => {
    if (woCompLoading) return true
    if (IsCompletionInProgress) return true
    else if (woDetails.wo_status_id === 15 || woDetails.wo_status_id === 75) return true
    else if (isAcceptanceWO && _.isEmpty(categories)) return true
    else if (!isAcceptanceWO && _.isEmpty(tasks)) return true
    else return false
  }
  const exportAsset = async () => {
    try {
      $('#pageLoading').show()
      setExportLoading(true)
      const res = await workorder.exportAssets({ wo_id: workOrderID })
      const list = _.get(res, 'data.assetList', [])
      setExportLoading(false)
      if (_.isEmpty(list)) {
        $('#pageLoading').hide()
        return Toast.error(`No completed assets found !`)
      }
      const excelData = []
      list.forEach(asset => excelData.push({ 'Asset Name': asset.formRetrivedAssetName, 'Inspection Date': getFormatedDate(asset.intialFormFilledDate, true) }))
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)
      XLSX.utils.book_append_sheet(wb, ws, 'Assets')
      XLSX.writeFile(wb, `${woDetails.manual_wo_number}.xlsx`)
      $('#pageLoading').hide()
    } catch (error) {
      $('#pageLoading').hide()
      setExportLoading(false)
      Toast.error(`Error exporting Asset. Please try again !`)
    }
  }
  const renderDescription = () => {
    if (_.isEmpty(woDetails)) return
    return (
      <>
        <div>
          {woDetails.description && woDetails.description.slice(0, 156)}
          {!isReadMore && woDetails.description.length > 156 && <span>...</span>}
          {isReadMore && woDetails.description.slice(156)}
        </div>
        {woDetails.description.length > 156 && (
          <button className='readmore-button text-xs' onClick={() => setReadMore(!isReadMore)} style={{ color: '#778899' }}>
            {!isReadMore ? 'Read More' : 'Read less'}
          </button>
        )}
      </>
    )
  }
  //
  const createNewLine = () => {
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.INSPECTION) setIsCreateOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.REPAIR) setRepairOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.ISSUE) setIssueOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.REPLACE) setReplaceOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK) setTroblecallCheckOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.INSTALL) setObOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.PM) setAddPmOpen(true)
    setAddNewLineOpen(false)
  }
  const updateAssetStatusAction = async (payload, obj) => {
    const status = { ACCEPT_MW: enums.woTaskStatus.Complete, HOLD_MW: enums.woTaskStatus.Hold }
    const isRepairReplace = enums.MWO_INSPECTION_TYPES.INSPECTION !== obj.inspection_type
    payload.status = status[payload.status]
    const req = isRepairReplace ? snakifyKeys(payload) : { wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMapping_id, status: payload.status }
    setFetchingForm(payload.woonboardingassetsId)
    try {
      const res = isRepairReplace ? await onBoardingWorkorder.updateAssetStatus(req) : await updateWOCategoryTaskStatus(req)
      if (res.success > 0) Toast.success(`Line Status Updated Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error updating status. Please try again !`)
    }
    setFetchingForm('')
    setReload(p => p + 1)
  }
  const rejectAssetAction = (obj, anchor) => {
    setIsRejectOpen(true)
    setAnchorObj({ ...obj, ...anchor })
    return
  }
  const closeRejectReasonModal = () => {
    setReason('')
    setIsRejectOpen(false)
  }
  const rejectAsset = async () => {
    const isRepairReplace = enums.MWO_INSPECTION_TYPES.INSPECTION !== anchorObj.inspection_type
    const payload = isRepairReplace ? { woonboardingassets_id: anchorObj.woonboardingassets_id, task_rejected_notes: reason, status: enums.woTaskStatus.Reject } : { wOcategorytoTaskMapping_id: anchorObj.wOcategorytoTaskMapping_id, task_rejected_notes: reason, status: enums.woTaskStatus.Reject }
    setRejectLoading(true)
    try {
      const res = isRepairReplace ? await onBoardingWorkorder.updateAssetStatus(payload) : await updateWOCategoryTaskStatus(payload)
      if (res.success > 0) Toast.success(`Line Rejected Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error rejecting line. Please try again !`)
    }
    setRejectLoading(false)
    setIsRejectOpen(false)
    setReload(p => p + 1)
    setReason('')
  }
  //
  const mainMenuOptions = [
    { id: 1, name: 'View', action: d => showAllViewTask('View'), disabled: () => _.isEmpty(categories) },
    { id: 2, name: 'Edit', action: d => handleAction('EDIT'), disabled: () => IsCompletionInProgress || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted },
    { id: 3, name: 'Review', action: d => (isAcceptanceWO ? showAllViewTask('Review') : reviewMaintenanceLines()), disabled: () => isReviewDisable },
  ]
  const acceptanceMenuOptions = [
    { id: 1, name: 'View Grid', action: d => handleSubAction('GRID', d) },
    { id: 2, name: 'Delete', action: d => handleSubAction('DEL', d), color: '#FF0000', disabled: d => IsCompletionInProgress || d.status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted },
  ]
  const acceptanceColumns = [
    {
      name: 'Group',
      render: d => {
        return (
          <div style={[enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(woDetails.wo_status_id) ? { pointerEvents: 'none' } : { pointerEvents: 'all' }} className='d-flex align-items-center group-name-parent'>
            <div className='mr-2'>{!_.isEmpty(d.group_string) ? d.group_string : 'NA'}</div>
            <div className='group-name-parent'>
              <ActionButton
                action={e => {
                  e.stopPropagation()
                  openUpdateGroup(d)
                }}
                icon={<EditOutlinedIcon fontSize='small' />}
                tooltip='EDIT GROUP'
              />
            </div>
          </div>
        )
      },
    },
    { name: 'Asset Class', accessor: 'asset_class_name' },
    { name: 'Form Name', accessor: 'form_name' },
    { name: 'WP', accessor: 'wp' },
    { name: 'Progress', render: d => `${d.progress_completed}/${d.progress_total}` },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getStatus(d.status_id)
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <Menu options={acceptanceMenuOptions} data={d} loading={fetchingForm === d.wo_inspectionsTemplateFormIOAssignment_id} width={165} />
        </div>
      ),
    },
  ]
  const downloadSample = () => {
    const link = document.createElement('a')
    link.href = URL.sampleAcceptanceQuote
    link.click()
  }
  const bulkUpload = e => {
    $('#pageLoading').show()
    try {
      e.preventDefault()
      if (!e.target.files[0]) return
      const reader = new FileReader()
      const file = e.target.files[0]
      reader.onload = async d => {
        const extension = file.name.split('.').slice(-1).pop()
        if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) setError('Invalid file format !')
        else {
          setError('')
          const binaryStr = d.target.result
          const wb = XLSX.read(binaryStr, { type: 'binary' })
          const res = await bulkImport(wb, camelizeKeys(woDetails))
          console.log('RES', res)
          $('#pageLoading').hide()
          if (!res.success) Toast.error(res.data || 'Upload data failed !')
          else processBulkUploadData(res.data)
        }
      }
      reader.readAsBinaryString(file)
      e.target.value = null
    } catch (error) {
      $('#pageLoading').hide()
      console.log(error)
      Toast.error('Upload data failed !')
    }
  }
  const dropDownMenuOptions = [
    { id: 1, type: 'button', text: isAcceptanceWO ? 'Add Asset Class' : 'Add Work Order Line', disabled: IsCompletionInProgress || woDetails.wo_status_id === enums.woTaskStatus.Complete, onClick: () => handleAction('NEW'), icon: <AddIcon fontSize='small' />, show: true, seperatorBelow: true },
    { id: 2, type: 'button', text: 'Download Sample File', onClick: downloadSample, icon: <GetAppOutlinedIcon fontSize='small' />, show: isAcceptanceWO },
    { id: 3, type: 'button', text: 'Upload Quote', disabled: IsCompletionInProgress || woDetails.wo_status_id === enums.woTaskStatus.Complete, onClick: handleUploadQuote, show: isAcceptanceWO, icon: <PublishOutlinedIcon />, seperatorBelow: true },
    { id: 11, type: 'button', text: 'Upload IR Photo', disabled: IsCompletionInProgress || woDetails.wo_status_id === enums.woTaskStatus.Complete, onClick: () => setUploadPreviewOpen(true), icon: <PublishOutlinedIcon />, show: !isAcceptanceWO },
    { id: 4, type: 'button', text: 'Generate Engineering Letter', disabled: itHaveMoreType || _.isEmpty(rows), onClick: () => handleAction('EXPORT', woDetails), icon: <InsertDriveFileOutlinedIcon fontSize='small' />, show: true },
    { id: 5, type: 'button', text: 'Export Assets', disabled: itHaveMoreType || exportLoading || _.isEmpty(rows), onClick: exportAsset, icon: <GetAppOutlinedIcon fontSize='small' />, show: true },
    { id: 6, type: 'input', show: isAcceptanceWO, onChange: addQuote, ref: uploadQuoteRef },
    { id: 7, type: 'button', text: 'Get Summary', disabled: itHaveMoreType || _.isEmpty(rows), onClick: () => getSummary(), icon: <PlayForWorkOutlinedIcon fontSize='small' />, show: !isAcceptanceWO },
    { id: 9, type: 'button', text: 'Bulk Export', disabled: _.isEmpty(rows), onClick: () => bulkExport(camelizeKeys(woDetails)), show: isAcceptanceWO, icon: <DescriptionOutlinedIcon fontSize='small' /> },
    { id: 10, type: 'button', text: 'Bulk Upload', disabled: woDetails.wo_status_id === enums.woTaskStatus.Complete || _.isEmpty(rows), onClick: () => uploadBulkRef.current && uploadBulkRef.current.click(), show: isAcceptanceWO, icon: <PublishOutlinedIcon /> },
    { id: 8, type: 'input', show: isAcceptanceWO, onChange: bulkUpload, ref: uploadBulkRef },
  ]
  const maintenanceMenuOptions = [
    // { id: 1, name: 'View', action: d => handleSubAction('VIEW', d) },
    { id: 2, name: 'Edit', action: d => handleSubAction('EDIT_MW', d), disabled: d => IsCompletionInProgress || d.status_id === enums.woTaskStatus.Submitted || d.status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted },
    { id: 3, name: 'Accept', action: d => handleSubAction('ACCEPT_MW', d), disabled: d => IsCompletionInProgress || d.status_id !== enums.woTaskStatus.ReadyForReview || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted },
    { id: 4, name: 'Reject', action: d => handleSubAction('REJECT_MW', d), disabled: d => IsCompletionInProgress || d.status_id !== enums.woTaskStatus.ReadyForReview || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted },
    { id: 5, name: 'Hold', action: d => handleSubAction('HOLD_MW', d), disabled: d => IsCompletionInProgress || d.status_id !== enums.woTaskStatus.ReadyForReview || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted },
    // { id: 6, name: 'Link - Fix Issues', action: d => handleSubAction('LINK_ISSUE', d), disabled: d => IsCompletionInProgress || d.inspection_type === enums.MWO_INSPECTION_TYPES.INSTALL },
    // {
    //   id: 7,
    //   name: 'Add PM to Workorder',
    //   action: d => handleSubAction('LINK_PM', d),
    //   disabled: d => d.inspection_type !== enums.MWO_INSPECTION_TYPES.INSPECTION || d.status_id === enums.woTaskStatus.Submitted || d.status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted,
    // },
    { id: 8, name: 'Delete', action: d => handleSubAction('DEL', d), color: '#FF0000', disabled: d => d.status_id === enums.woTaskStatus.Submitted || d.status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted },
  ]
  const renderText = text => (_.isEmpty(text) ? 'N/A' : text)
  const renderInspectionType = (text, d) => {
    const type = inspectionTypes.find(d => d.value === text)
    if (_.isEmpty(type)) return 'N/A'
    if (type.value === enums.MWO_INSPECTION_TYPES.PM) return _.get(d, 'asset_pm_title', 'N/A')
    return type.label
  }
  const maintenanceColumns = [
    { name: 'Identification', accessor: 'assigned_asset_name' },
    { name: 'Asset Class', accessor: 'asset_class_name' },
    { name: 'Category', render: d => renderInspectionType(d.inspection_type, d) },
    { name: 'Submitted By', render: d => renderText(d.technician_name) },
    { name: 'Room', accessor: 'room' },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getStatus(d.status_id)
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <Menu options={maintenanceMenuOptions} data={d} loading={fetchingForm === d.wo_inspectionsTemplateFormIOAssignment_id} width={155} />
        </div>
      ),
    },
  ]
  const attachmentColumns = [
    { name: 'Attachment Name', accessor: 'user_uploaded_name' },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton action={() => window.open(d.file_url, '_blank')} icon={<VisibilityOutlinedIcon fontSize='small' />} tooltip='VIEW' />
          {woDetails.wo_status_id !== enums.woTaskStatus.Complete && <ActionButton action={() => handleAction('DELETE', d)} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#ff0000' }} />} tooltip='DELETE' />}
        </div>
      ),
    },
  ]
  useEffect(() => {
    let filteredRows = isAcceptanceWO ? [...categories] : [...tasks]
    if (!_.isEmpty(searchString)) {
      if (isAcceptanceWO) {
        filteredRows = rows.filter(
          x =>
            (x.form_name !== null && x.form_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.asset_class_name !== null && x.asset_class_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.wp !== null && x.wp.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.group_string !== null && x.group_string.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.group_string !== null && x.group_string.toLowerCase().includes(searchString.toLowerCase()))
        )
      } else {
        filteredRows = rows.filter(
          x =>
            (!_.isEmpty(x.form_name) && x.form_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (!_.isEmpty(x.assigned_asset_name) && x.assigned_asset_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (!_.isEmpty(x.asset_class_name) && x.asset_class_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (!_.isEmpty(x.wp) && x.wp.toLowerCase().includes(searchString.toLowerCase()))
        )
      }
    }
    setRows(filteredRows)
  }, [searchString])
  //
  const openUpdateGroup = data => {
    setUpdateGroupString(data.group_string)
    setUpdateGroupOpen(true)
    setUpdateGroupObj(data)
  }
  const updateTestingGroup = async () => {
    try {
      setUpdateGroupLoading(true)
      const res = await assetClass.updateGroupName({ group_string: updateGroupString, wo_inspectionsTemplateFormIOAssignment_id: [updateGroupObj.wo_inspectionsTemplateFormIOAssignment_id] })
      if (res.success > 0) {
        Toast.success('Group name updated !')
        setReload(p => p + 1)
      } else Toast.error(res.message)
      setUpdateGroupLoading(false)
      setUpdateGroupOpen(false)
    } catch (error) {
      Toast.error('Error uploading file. Please try again !')
      setUpdateGroupLoading(false)
      setUpdateGroupOpen(false)
    }
  }
  //get summary
  const getSummary = () => {
    const classNames = {}
    const summary = []

    const completedTasks = rows.filter(task => [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(task.status_id))
    completedTasks.forEach(d => (_.isEmpty(classNames[d.asset_class_name]) ? (classNames[d.asset_class_name] = d.asset_class_code) : null))
    const occurances = _.countBy(completedTasks, d => d.asset_class_name)
    Object.keys(occurances).forEach(d => summary.push({ 'Asset Class Name': d, 'Asset Class Code': classNames[d], Quantity: occurances[d] }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(summary)
    XLSX.utils.book_append_sheet(wb, ws, 'Summary')
    XLSX.writeFile(wb, `${woDetails.manual_wo_number}-Summary.xlsx`)
  }
  const viewTempIssue = async d => {
    //console.log(d)
    if (_.isEmpty(d.woonboardingassetsId)) {
      const { form_id, asset_form_id, wOcategorytoTaskMapping_id } = rows.find(row => row.asset_form_id === d.assetFormId)
      try {
        setIssueLoading(d.woLineIssueId)
        const res = await getFormJson({ form_id, asset_form_id })
        setAnchorObj({ form_data: res.data.asset_form_data, wOcategorytoTaskMapping_id, issueTitle: d.issueTitle.split('_').join(' '), isIssue: true })
        setIssueLoading('')
        viewInspectionForm()
      } catch (error) {
        setIssueLoading('')
        console.log(error)
      }
    } else {
      try {
        setIssueLoading(d.woLineIssueId)
        const res = await onBoardingWorkorder.getAssetDetail({ id: d.woonboardingassetsId })
        setAnchorObj(res.data)
        setIssueLoading('')
        setIsViewRepairObOpen(true)
      } catch (error) {
        setIssueLoading('')
        console.log(error)
      }
    }
  }
  const linkFixIssue = d => {
    setAnchorObj(d)
    setLinkFixIssueOpen(true)
  }
  const linkPM = d => {
    setAnchorObj(d)
    setLinkPmOpen(true)
  }
  //check completeion status
  useEffect(() => {
    checkCompletionStatus()
    checkBulkUploadStatus()
  }, [])
  const checkCompletionStatus = async () => {
    if (isEmpty(window.location.pathname.split('/')[3])) return
    try {
      const res = await workorder.checkCompletionStatus(workOrderID)
      setCompletionProcessStatus(res.data.completeWoThreadStatus)
      if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.IN_PROGRESS) setTimeout(() => checkCompletionStatus(), 5000)
      else if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.COMPLETED) setReload(p => p + 1)
      else if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.FAILED) Toast.error('Previous completion process failed !')
    } catch (error) {
      console.log(error)
    }
  }
  // bulk upload
  const processBulkUploadData = async data => {
    try {
      const res = await workorder.bulkImportAssetForm({ wo_id: workOrderID, file_name: data.key || data.Key })
      if (res.data) {
        setBulkUploadProcessStatus(enums.BULK_UPLOAD_STATUS.IN_PROGRESS)
        Toast.success('Bulk upload process started !')
        checkBulkUploadStatus()
      } else Toast.error('Bulk upload process failed !')
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
  }
  const checkBulkUploadStatus = async () => {
    if (isEmpty(window.location.pathname.split('/')[3])) return
    try {
      const res = await workorder.bulkImportAssetFormStatus(workOrderID)
      setBulkUploadProcessStatus(res.data.bulkDataImportStatus)
      if (res.data.bulkDataImportStatus === enums.BULK_UPLOAD_STATUS.IN_PROGRESS) setTimeout(() => checkBulkUploadStatus(), 5000)
      else if (res.data.bulkDataImportStatus === enums.BULK_UPLOAD_STATUS.COMPLETED) {
        //Toast.success('Data uploaded successfully !')
        setReload(p => p + 1)
      } else if (res.data.bulkDataImportStatus === enums.BULK_UPLOAD_STATUS.FAILED) {
        $('#pageLoading').hide()
        Toast.error('Previous bulk upload process failed !')
        const failed = JSON.parse(_.get(res.data, 'bulkDataImportFailedLogs', '[]'))
        const failedNames = []
        failed.forEach(d => failedNames.push({ sheet: d.split(' ')[0], asset: d.split(' ')[2].slice(1, -1) }))
        setFailedAssets(failedNames)
        setFailedPopUpOpen(true)
      }
    } catch (error) {
      console.log(error)
    }
  }
  //
  const reviewMaintenanceLines = () => {
    setReviewLinesOpen(true)
  }
  // open issue line
  const checkOriginWoLineId = rows => {
    const query = new URLSearchParams(window.location.search)
    if (!isEmpty(query.get('originWoLineId')) && !originIssueOpened) {
      const d = rows.find(d => d.woonboardingassets_id === query.get('originWoLineId') || d.asset_form_id === query.get('originWoLineId'))
      setOriginIssueOpened(true)
      handleSubAction('VIEW', d)
    }
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
  const uploadPhoto = async files => {
    const formData = new FormData()
    files.forEach((file, i) => {
      formData.append(`file-${i}`, file, file.name)
    })
    formData.append('manual_wo_number', woDetails.manual_wo_number)
    formData.append('wo_id', workOrderID)
    setUploading(true)
    try {
      const res = await onBoardingWorkorder.uploadIrPhoto(formData)
      if (res.success) {
        Toast.success('IR Images uploaded !')
        console.log(files)
        //showPhotos(files)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading images !')
    }
    setUploading(false)
  }
  const closeOnUploadPopUp = () => {
    setUploadPreviewOpen(false)
    // setTab(uploadTabs.UPLOAD)
    // setUploadPreviewFiles([])
  }
  const addPmAfterSubmit = d => {
    setReload(p => p + 1)
    setAnyPmList(d)
    if (!_.isEmpty(d)) handleSubAction('EDIT_MW', d[0])
  }

  const handleSkip = () => {
    if (currentPmIndex === anyPmList.length - 1) return handleCancel()
    handleSubAction('EDIT_MW', anyPmList[currentPmIndex + 1])
    setCurrentPmIndex(p => p + 1)
  }
  const handleCancel = () => {
    setReload(p => p + 1)
    setAnyPmList([])
    setCurrentPmIndex(0)
    setShowSkipInPm(false)
  }
  //after creation of issue
  const postIssueAddSuccess = d => {
    setReload(p => p + 1)
    if (!_.isEmpty(d)) handleSubAction('EDIT_MW', d)
  }

  const woState = {
    filter: get(history, 'location.state.filter', []),
    pageRows: get(history, 'location.state.pageRows', 20),
    search: get(history, 'location.state.search', ''),
    pageIndex: get(history, 'location.state.pageIndex', 1),
  }
  const handleTechnician = () => {
    if (isEmpty(woDetails)) return

    const maxVisibleTechnicians = 3
    const visibleTechnicians = isShowMore ? get(woDetails, 'technician_mapping_list', []) : woDetails.technician_mapping_list.slice(0, maxVisibleTechnicians)

    return (
      <>
        <div className='d-flex align-items-center flex-wrap'>
          {!isEmpty(visibleTechnicians)
            ? visibleTechnicians.map(d => (
                <div key={d.user_id} className='ml-2 mb-2'>
                  <StatusComponent color='#848484' label={`${d.firstname} ${d.lastname}`} size='small' />
                </div>
              ))
            : 'N/A'}
        </div>
        {woDetails.technician_mapping_list.length > maxVisibleTechnicians && (
          <button className='readmore-button text-xs ml-2' onClick={() => setShowMore(!isShowMore)} style={{ color: '#778899' }}>
            {!isShowMore ? 'Show More' : 'Show less'}
          </button>
        )}
      </>
    )
  }

  const TitleCount = ({ title, count, bg }) => (
    <div className='d-flex align-items-center'>
      {title}
      <span className='ml-2 text-bold d-flex align-items-center justify-content-center' style={{ width: '20px', height: '20px', background: bg || '#a6a6a6', color: '#fff', borderRadius: '4px', fontSize: '11px' }}>
        {count}
      </span>
    </div>
  )
  const StatusMetric = ({ count, loading, icon: Icon, color }) => (
    <div className='d-flex justify-content-start align-items-center mr-1' style={{ border: '1px solid #e0e0e0', borderRadius: '4px', width: `56px`, minWidth: '56px', padding: '2px' }}>
      <div className='mr-2 d-flex justify-content-center align-items-center' style={{ borderRadius: '4px', padding: '8px', background: `${count === 0 ? '#00000020' : `${color}35`}`, width: 27, height: 27 }}>
        <Icon fontSize='small' style={{ color: count === 0 ? '#00000050' : color }} />
      </div>
      <div>
        {loading ? (
          <CircularProgress size={15} thickness={5} style={{ marginTop: '5px' }} />
        ) : (
          <div style={{ fontSize: 13, opacity: count === 0 ? 0.4 : 1 }} className='text-bold'>
            {count}
          </div>
        )}
      </div>
    </div>
  )
  const getStatusWiseCount = status =>
    get(
      rows.filter(d => d.status === status),
      'length',
      0
    )

  const handleDueDateText = () => {
    return !isEmpty(get(woDetails, 'due_date', '')) ? (
      <span style={{ color: woDetails.due_in.includes('Overdue') ? 'red' : '' }} className={woDetails.due_in.includes('Overdue') ? 'text-bold' : ''}>
        {getFormatedDate(woDetails.due_date.split(' ')[0])} ({get(woDetails, 'due_in', '').trim()})
      </span>
    ) : (
      'N/A'
    )
  }
  return (
    <div style={{ padding: '20px', background: '#fff', height: `calc(100vh - 64px)` }}>
      {/* Title & Status */}
      <CompletionStatus text='Workorder completion is still In Progress' status={completionProcessStatus} inProgress={enums.WO_COMPLETION_STATUS.IN_PROGRESS} />
      <CompletionStatus text='Uploading is in progress ...' status={bulkUploadProcessStatus} inProgress={enums.BULK_UPLOAD_STATUS.IN_PROGRESS} />
      <div className='d-flex align-items-center mb-3 justify-content-between'>
        <div className='d-flex align-items-center'>
          <div className='mr-2'>
            <ActionButton action={() => history.push({ pathname: '/workorders', state: woState })} icon={<ArrowBackIcon fontSize='small' />} tooltip='GO BACK' />
          </div>
          <div style={{ fontWeight: 800, fontSize: '16px', marginRight: '8px' }}>{woDetails.manual_wo_number}</div>
          <StatusComponent color={color} label={label} size='medium' />
        </div>
        <Menu options={mainMenuOptions} loading={viewAllTaskLoading} noToolip />
      </div>
      {/* Header */}
      <div style={{ padding: '16px 32px', background: '#fafafa', borderRadius: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {/* <LabelVal label='WO Number' value={woDetails.manual_wo_number} inline /> */}
          <LabelVal inline label='Work Type' value={get(woDetails, 'wo_type_name', '')} />
          <LabelVal label='Start Date' value={woDetails.start_date ? getFormatedDate(woDetails.start_date.split(' ')[0]) : ''} inline />
          <LabelVal label='Due Date' value={handleDueDateText()} inline />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
          <div className='mr-1'>
            <LabelVal inline label='Description' value={renderDescription()} lableMinWidth={85} />
          </div>
          <LabelVal inline label='Assigned  Technicians' value={handleTechnician()} lableMinWidth={85} />
          {/* <LabelVal label='Enterprise' value={woDetails.client_company_name} inline /> */}

          {/* {<Menu options={mainMenuOptions} loading={viewAllTaskLoading} noToolip />} */}
        </div>
        {/* <LabelVal label='Facility' value={woDetails.site_name} inline /> */}
      </div>
      <div style={{ padding: '0px 32px', background: '#fafafa', borderRadius: '4px' }}></div>
      {/* Action Buttons for Acceptance */}
      {isAcceptanceWO && (
        <div className='d-flex flex-row justify-content-between align-items-center mt-3' style={{ width: '100%' }}>
          <div className='d-flex align-items-center'>
            <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} error={error} />
            {!_.isEmpty(error) && isAcceptanceWO && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{error}</span>}
          </div>
          <SearchComponent searchString={searchString} setSearchString={setSearchString} />
        </div>
      )}

      {/* Tabs */}
      {!isAcceptanceWO && (
        <div className='assets-box-wraps customtab'>
          <AppBar position='static' color='inherit'>
            <Tabs id='controlled-tab-example' activeKey={selectedTab} onSelect={k => setTab(k)}>
              <Tab eventKey='DEFAULT' title={<TitleCount title='Line Items' count={get(rows, 'length', '0')} />} tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='ATTACHMENTS' title={<TitleCount title='Attachments' count={get(woDetails, 'workOrderAttachments.length', '0')} />} tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='NEW_ISSUES' title={<TitleCount title='Issues' count={get(woDetails, 'issues_count', '0')} bg='red' />} tabClassName='font-weight-bolder small-tab'></Tab>
            </Tabs>
          </AppBar>
        </div>
      )}

      {selectedTab === 'DEFAULT' && (
        <>
          {!isAcceptanceWO && (
            <div className='d-flex flex-row justify-content-between align-items-center mt-2' style={{ width: '100%' }}>
              <div className='d-flex align-items-center'>
                {/* ACTION */}
                <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} error={error} />
                {!_.isEmpty(error) && isAcceptanceWO && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{error}</span>}
                {/* COUNTS */}
                <div className='d-flex align-items-center ml-2'>
                  <StatusMetric count={getStatusWiseCount(enums.woTaskStatus.Open)} loading={loading} icon={AccessTimeOutlinedIcon} color='#3941F1' />
                  <StatusMetric count={getStatusWiseCount(enums.woTaskStatus.InProgress)} loading={loading} icon={UpdateOutlinedIcon} color='#3291DD' />
                  <StatusMetric count={getStatusWiseCount(enums.woTaskStatus.ReadyForReview)} loading={loading} icon={FindInPageOutlinedIcon} color='#FA0B0B' />
                  <StatusMetric count={getStatusWiseCount(enums.woTaskStatus.Complete)} loading={loading} icon={CheckCircleOutlineOutlinedIcon} color='#41BE73' />
                </div>
              </div>
              {/* TOGGLE */}
              <div className='d-flex' style={{ padding: '2px', background: '#f6f6f6', width: 'fit-content', borderRadius: '4px' }}>
                <ToggleButton label='Default' value='DEFAULT' selected={subTab} onChange={setSubTab} />
                <ToggleButton label='Asset Wise' value='ASSETWISE' selected={subTab} onChange={setSubTab} />
              </div>
              {/* SEARCH */}
              <SearchComponent searchString={searchString} setSearchString={setSearchString} />
            </div>
          )}
          {/* Acceptance Table */}
          {isAcceptanceWO && (
            <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `50%`, marginTop: '10px' }}>
              <TableComponent loading={loading} columns={acceptanceColumns} data={rows} onRowClick={d => handleSubAction('VIEWLINE', d)} isForViewAction={true} />
            </div>
          )}
          {/* Maintenance Table */}
          {!isAcceptanceWO && subTab === 'DEFAULT' && (
            <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `50%`, marginTop: '10px' }}>
              <TableComponent loading={loading} columns={maintenanceColumns} data={rows} onRowClick={d => handleSubAction('VIEW', d)} isForViewAction={true} />
            </div>
          )}
          {subTab === 'ASSETWISE' && !isAcceptanceWO && <AssetWise data={rows} onRowClick={handleSubAction} />}
        </>
      )}

      {/* Attachments Table */}
      {selectedTab === 'ATTACHMENTS' && !isAcceptanceWO && (
        <>
          <div className='d-flex flex-row justify-content-between align-items-center' style={{ width: '100%' }}>
            <input ref={uploadInputRef} type='file' style={{ display: 'none' }} onChange={addAttachment} />
            <MinimalButton size='small' disabled={woDetails.wo_status_id === enums.woTaskStatus.Complete} startIcon={<AddIcon />} text='Add Attachment' onClick={() => uploadInputRef.current && uploadInputRef.current.click()} variant='contained' color='primary' baseClassName='my-2' />
          </div>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `calc(100vh - 460px)` }}>
            <TableComponent loading={loading} columns={attachmentColumns} data={woDetails.workOrderAttachments} />
          </div>
        </>
      )}
      {selectedTab === 'NEW_ISSUES' && <NewIssues viewTempIssue={viewTempIssue} woId={workOrderID} />}

      {bulkUploadProcessStatus !== enums.BULK_UPLOAD_STATUS.IN_PROGRESS && (
        <div className='d-flex row-reverse justify-content-end my-2 sticky-bottom-btn' style={{ position: 'absolute', bottom: 0, right: '6px' }}>
          <div className='d-flex align-items-center' style={getEnableStatus() ? { cursor: 'not-allowed', color: 'grey' } : {}}>
            <div style={{ fontWeight: 800, marginRight: '5px', color: getEnableStatus() ? '#00000075' : '#000' }}>Override</div>
            <Checkbox checked={isOverride} disabled={getEnableStatus()} onChange={e => setOverride(e.target.checked)} name='checkedB' color='primary' size='small' style={{ padding: '2px' }} />
          </div>
          <Button variant='contained' color='primary' className='nf-buttons mx-2' onClick={() => setIsCompleteOpen(true)} disableElevation disabled={checkCompWOEnableStatus()}>
            {'Complete Workorder'}
            {/* {woCompLoading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />} */}
          </Button>
        </div>
      )}
      <DialogPrompt title='Complete Work Order' text='Are you sure you want to complete Work Order ? Work order lines with Open status would be deleted' actionLoader={woCompLoading} open={isCompleteOpen} ctaText='Complete' action={completeWO} handleClose={() => setIsCompleteOpen(false)} />
      {/* {isCreateOpen && <WOAddCategory workOrderID={workOrderID} obj={woDetails} open={isCreateOpen} onClose={() => setIsCreateOpen(false)} afterSubmit={() => setReload(p => p + 1)} />} */}
      {isCreateOpen && isAcceptanceWO && <AddAssetClass workOrderID={workOrderID} obj={woDetails} open={isCreateOpen} onClose={() => setIsCreateOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {isCreateOpen && !isAcceptanceWO && <AssignAsset workOrderID={workOrderID} obj={woDetails} open={isCreateOpen} onClose={() => setIsCreateOpen(false)} afterSubmit={() => setReload(p => p + 1)} openCreateNew={() => setCreateNewMwAssetOpen(true)} />}
      {assignTechOpen && <AssignTechinican obj={anchorObj} open={assignTechOpen} onClose={() => setIsAssignTechOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {isGridViewOpen && <GridView obj={anchorObj} open={isGridViewOpen} onClose={() => setGridViewOpen(false)} afterSubmit={() => setReload(p => p + 1)} woStatusId={woDetails !== null ? woDetails.wo_status_id : 0} />}
      {isViewLineOpen && (
        <TaskList
          equipmentListOptions={equipmentListOptions}
          obj={anchorObj}
          woStatusId={woDetails !== null ? woDetails.wo_status_id : 0}
          woType={woDetails !== null ? woDetails.wo_type : 0}
          open={isViewLineOpen}
          onClose={() => closeViewLine()}
          afterSubmit={() => setReload(p => p + 1)}
          showAllTask={isShowAllViewTask}
          masterForms={masterForms}
          woId={workOrderID}
        />
      )}
      {isReviewOpen && (
        <TaskList
          obj={anchorObj}
          equipmentListOptions={equipmentListOptions}
          woStatusId={woDetails !== null ? woDetails.wo_status_id : 0}
          woType={woDetails !== null ? woDetails.wo_type : 0}
          open={isReviewOpen}
          onClose={() => closeReviewLine()}
          afterSubmit={() => setReload(p => p + 1)}
          showAllTask={isShowAllViewTask}
          masterForms={masterForms}
          woId={workOrderID}
          isForReview={true}
        />
      )}
      {editWOOpen && <EditWO obj={woDetails} open={editWOOpen} onClose={() => setEditWOOpen()} afterSubmit={() => setReload(p => p + 1)} />}
      {isViewOpen && <WOCategoryView equipmentListOptions={equipmentListOptions} isEdit={inspectionTypeIsEdit} open={isViewOpen} onClose={() => closeView()} obj={anchorObj} woStatusId={woDetails !== null ? woDetails.wo_status_id : 0} />}
      <DialogPrompt title='Delete Attachment' text='Are you sure you want to remove the attachment from Work Order?' open={isDeleteAttOpen} ctaText='Remove' action={delAttachment} handleClose={() => setDeleteAttOpen(false)} />
      <DialogPrompt title={`Delete ${isAcceptanceWO ? 'Class' : 'Line'}`} text={`Are you sure you want to remove the ${isAcceptanceWO ? 'class' : 'line'} from Work Order?`} open={delCatOpen} ctaText='Remove' action={delCategory} handleClose={() => setDelCatOpen(false)} />
      <DialogPrompt title={`Hold ${isAcceptanceWO ? 'Class' : 'Line'}`} text={`Are you sure you want to hold the ${isAcceptanceWO ? 'class' : 'line'} from this Work Order?`} open={holdCatOpen} ctaText='Hold' action={holdCategory} handleClose={() => setHoldCatOpen(false)} />
      {isAddNewLineOpen && (
        <PopupModal open={isAddNewLineOpen} onClose={() => setAddNewLineOpen(false)} title='Category' handleSubmit={createNewLine} cta='Create'>
          <div className='text-bold mb-2'>Please select any one category from below.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {inspectionTypes.map((d, i) => (
              <div key={d.value} style={[4, 6].includes(i) ? { gridColumn: '2/4' } : {}}>
                <MinimalRadio key={d.value} label={d.label} onClick={() => setSelectedInspectionType(d.value)} selected={d.value === selectedInspectionType} />
              </div>
            ))}
          </div>
        </PopupModal>
      )}
      {isViewRepairOpen && <View obj={anchorObj} open={isViewRepairOpen} onClose={() => setIsViewRepairOpen(false)} />}
      {/* REPAIR FORMS */}
      {isIssueOpen && <Issue open={isIssueOpen} onClose={() => setIssueOpen(false)} workOrderID={workOrderID} afterSubmit={postIssueAddSuccess} classCodeOptions={classCodeOptions} />}
      {isRepairOpen && <Repair isRepair={true} obj={woDetails} workOrderID={workOrderID} open={isRepairOpen} onClose={() => setRepairOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {editWorkOrderLine.open && editWorkOrderLine.isRepair && (
        <Repair isRepair={true} workOrderID={workOrderID} isEdit={true} obj={anchorObj} open={editWorkOrderLine.open && editWorkOrderLine.isRepair} onClose={() => setEditWorkOrderLine({ open: false, isRepair: false, isInspection: false, isReplace: false, isTroubleCall: false, isOnboarding: false })} afterSubmit={() => setReload(p => p + 1)} />
      )}
      {/* REPLACE FORMS */}
      {isReplaceOpen && <Repair isReplace={true} obj={woDetails} workOrderID={workOrderID} open={isReplaceOpen} onClose={() => setReplaceOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {editWorkOrderLine.open && editWorkOrderLine.isReplace && (
        <Repair isReplace={true} workOrderID={workOrderID} isEdit={true} obj={anchorObj} open={editWorkOrderLine.open && editWorkOrderLine.isReplace} onClose={() => setEditWorkOrderLine({ open: false, isRepair: false, isInspection: false, isReplace: false, isTroubleCall: false, isOnboarding: false })} afterSubmit={() => setReload(p => p + 1)} />
      )}
      {/* TROUBLE CALL CHECK FORMS */}
      {isTroblecallCheckOpen && <Repair isTroblecall={true} obj={woDetails} workOrderID={workOrderID} open={isTroblecallCheckOpen} onClose={() => setTroblecallCheckOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {editWorkOrderLine.open && editWorkOrderLine.isTroubleCall && (
        <Repair
          isTroblecall={true}
          workOrderID={workOrderID}
          isEdit={true}
          obj={anchorObj}
          open={editWorkOrderLine.open && editWorkOrderLine.isTroubleCall}
          onClose={() => setEditWorkOrderLine({ open: false, isRepair: false, isInspection: false, isReplace: false, isTroubleCall: false, isOnboarding: false })}
          afterSubmit={() => setReload(p => p + 1)}
        />
      )}
      {/* OB FORMS */}
      {isObOpen && <Install isOnboarding={true} viewObj={camelizeKeys(woDetails)} open={isObOpen} onClose={() => setObOpen(false)} afterSubmit={() => setReload(p => p + 1)} isNew classCodeOptions={classCodeOptions} workOrderID={workOrderID} isInstalling />}
      {isViewRepairObOpen && <ViewOB isOnboarding={true} viewObj={camelizeKeys(anchorObj)} open={isViewRepairObOpen} onClose={() => setIsViewRepairObOpen(false)} />}
      {editWorkOrderLine.open && editWorkOrderLine.isOnboarding && (
        <Install
          isOnboarding={true}
          viewObj={camelizeKeys(anchorObj)}
          open={editWorkOrderLine.open && editWorkOrderLine.isOnboarding}
          onClose={() => setEditWorkOrderLine({ open: false, isRepair: false, isInspection: false, isReplace: false, isTroubleCall: false, isOnboarding: false })}
          afterSubmit={() => setReload(p => p + 1)}
          classCodeOptions={classCodeOptions}
          workOrderID={workOrderID}
          isInstalling
        />
      )}
      {/* NEW ASSET INSPECTION TYPE */}
      {isCreateNewMwAssetOpen && <CreateNewAsset openForm={handleSubAction} obj={woDetails} open={isCreateNewMwAssetOpen} afterSubmit={() => setReload(p => p + 1)} onClose={() => setCreateNewMwAssetOpen(false)} />}
      {/* REJECT POPUP */}
      {isRejectOpen && (
        <PopupModal open={isRejectOpen} onClose={closeRejectReasonModal} title='Reject Asset' loading={rejectLoading} handleSubmit={rejectAsset}>
          <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
        </PopupModal>
      )}
      {/* UPDATE GROUP NAME */}
      {isUpdateGroupOpen && (
        <PopupModal open={isUpdateGroupOpen} onClose={() => setUpdateGroupOpen(false)} title='Update Testing Group' loading={isUpdateGroupLoading} handleSubmit={updateTestingGroup}>
          <MinimalInput value={updateGroupString} onChange={setUpdateGroupString} placeholder='Enter group name' w={100} />
        </PopupModal>
      )}
      {/* UPDATE GROUP NAME */}
      {isUpdateGroupOpen && (
        <PopupModal open={isUpdateGroupOpen} onClose={() => setUpdateGroupOpen(false)} title='Update Testing Group' loading={isUpdateGroupLoading} handleSubmit={updateTestingGroup}>
          <MinimalInput value={updateGroupString} onChange={setUpdateGroupString} placeholder='Enter group name' w={100} />
        </PopupModal>
      )}
      {/* LINK FIX ISSUES */}
      {linkFixIssueOpen && <LinkFixIssues loadingId={issueLoading} woId={workOrderID} open={linkFixIssueOpen} onClose={() => setLinkFixIssueOpen(false)} obj={{ ...anchorObj, woStatus: woDetails.wo_status_id }} />}
      {/* LINK PMs */}
      {isLinkPmOpen && <LinkPMs open={isLinkPmOpen} onClose={() => setLinkPmOpen(false)} obj={camelizeKeys(anchorObj)} />}
      {/* WHEN BULK UPLOAD FAILS FOR SOME ASSETS */}
      {isFailedPopUpOpen && (
        <PopupModal open={isFailedPopUpOpen} onClose={() => setFailedPopUpOpen(false)} title='Upload Failed' noActions>
          <div className='text-bold'>Last performed bulk upload opration failed for following assets !</div>
          <div className='d-flex mt-2'>
            <div className='p-2 text-bold' style={{ width: '50%', background: '#93939380' }}>
              Sheet Name
            </div>
            <div className='p-2 text-bold' style={{ width: '50%', background: '#93939380' }}>
              Identification
            </div>
          </div>
          {failedAssets.map((d, i) => (
            <div key={`failed-asset-${i}`} className='d-flex'>
              <div className='p-1' style={{ width: '50%', borderBottom: '1px dashed #93939380' }}>
                {d.sheet}
              </div>
              <div className='p-1' style={{ width: '50%', borderBottom: '1px dashed #93939380' }}>
                {d.asset}
              </div>
            </div>
          ))}
        </PopupModal>
      )}
      {/* REVIEW MWO LINES */}
      {isReviewLinesOpen && <ReviewLines equipmentListOptions={equipmentListOptions} workOrderID={workOrderID} open={isReviewLinesOpen} onClose={() => setReviewLinesOpen(false)} data={camelizeKeys(rows)} afterSubmit={() => setReload(p => p + 1)} />}
      {/* PM  */}
      {isAddPmOpen && <AddPM open={isAddPmOpen} workOrderID={workOrderID} afterSubmit={addPmAfterSubmit} onClose={() => setAddPmOpen(false)} classCodeOptions={classCodeOptions} />}
      {isViewPmOpen && <ViewForm isView open={isViewPmOpen} onClose={() => setViewPmOpen(false)} data={anchorObj.data} submisson={anchorObj.submissionData} obj={camelizeKeys(anchorObj.obj)} />}
      {isEditPmOpen && <EditForm open={isEditPmOpen} onClose={() => setEditPmOpen(false)} data={anchorObj.data} afterSubmit={() => setReload(p => p + 1)} submisson={anchorObj.submissionData} obj={camelizeKeys(anchorObj.obj)} />}
      {isViewThermographyOpen && <ThermographyForm isView open={isViewThermographyOpen} onClose={() => setViewThermographyOpen(false)} submisson={anchorObj.submissionData} obj={camelizeKeys(anchorObj.obj)} />}
      {isEditThermographyOpen && (
        <ThermographyForm
          open={isEditThermographyOpen}
          onClose={() => setEditThermographyOpen(false)}
          submisson={anchorObj.submissionData}
          obj={camelizeKeys(anchorObj.obj)}
          afterSubmit={() => setReload(p => p + 1)}
          canBeSkipped={showSkipInPm}
          anyPmList={anyPmList}
          currentPmIndex={currentPmIndex}
          handleSkip={handleSkip}
          handleCancel={handleCancel}
        />
      )}
      {uploadPreviewOpen && <UploadIrPhotos open={uploadPreviewOpen} onClose={closeOnUploadPopUp} workOrderID={workOrderID} manualWoNumber={woDetails.manual_wo_number} />}
    </div>
  )
}

export default AcceptanceTWO

import * as React from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';



// MUI components
import {
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Typography,
  LinearProgress
} from '@mui/material';
import TransformIcon from '@mui/icons-material/Transform';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import TextContentDisplay from './TextContentDisplay';




  export default function ExportReport(props) {
    const {  runRequest, token, reportId, paramValues , outExportDone } = props;


    const [job, setJob] = React.useState({});
    const [jobId, setJobId] = React.useState('');
    const [jobDone, setJobDone] = React.useState(false);

    const [working, setWorking] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState('');
    const [rendition, setRendition] = React.useState({});

    const [jobView, setJobView] = React.useState({});

    const [jobRefresh, setJobRefresh] = React.useState(false);
    const [fileName, setFileName] = React.useState('');
    const [output, setOutput] = React.useState('PDF');


    const [activeId, setActiveId] = React.useState('');

    const addActiveId = (item) => {
      let array = activeId.split(',');
      if (!array.find((obj) => {return obj===item})) {
        array.push(item);
        setActiveId(array.join(','));
      }
    }
  
    const removeActiveId = (item) => {
      let tmpActId = activeId;
      let array = [];
      for (let i=0; i<tmpActId.split(',').length; i++) {
        if (tmpActId.split(',')[i]!==item) {
          array.push(tmpActId.split(',')[i]);
        }
      }
      setActiveId(array.join(','));
    }


    const handleSendToExport = (componentId) => {
      setErrorMsg('')
      setWorking(true);

      addActiveId(componentId);
      


      let data = `jobName=automatic_job_${reportId}&`;
      if (paramValues && paramValues.length>0) {
        data += `paramValues=${JSON.stringify(paramValues)}&`; //[{"name" : "Region","value": "West"},{"name" : "State","value": "NH"}]
      }
      data += `fileType=rptdesign&`
      data += `outputFileName=${fileName}&`
      data += `replaceExisting=true&`
      data += `outputFileFormat=${output}`

      console.log('Data is:');
      console.log(data);

      let req = { 
        method: 'post',
        url: `${process.env.REACT_APP_IHUB_REST_URL}/api/v2/jobs/schedule/now/${reportId}`, 
        data: data,
        headers: { 'AuthToken': token, 'Accept': '*/*', 'Content-Type': 'application/x-www-form-urlencoded' } 
      };
      runRequest(req, (res) => {
        if (res.status && (res.status===201)) {
          setJobId(res.data.jobId);
          setJob(res.data);
          setWorking(false);
        }
        removeActiveId(componentId)

      }, '', []);

    }

    const handleJobRefresh = (componentId) => {
      addActiveId(componentId);

      let req = { 
        method: 'get',
        url: `${process.env.REACT_APP_IHUB_REST_URL}/api/v2/jobs/${jobId}/status`,
        headers: { 'AuthToken': token, 'Accept': '*/*' } 
      };
      runRequest(req, (res) => {
        if (res.status && (res.status===200)) {
          setJob(res.data);
          if (res.data.job?.state==='Succeeded') {
            //done
            setJobDone(true);
            
          } else {
            if (res.data.job?.state==='Error') {
              setErrorMsg('There is an error in the Job. Check the job file.');
            }
          }
        }
        removeActiveId(componentId);
        setJobRefresh(false);

      }, '', []);
      
    }

    const handleDownloadFile = (fileId, componentId) => {
      addActiveId(componentId);

      let req = { 
        method: 'get',
        url: `${process.env.REACT_APP_IHUB_REST_URL}/api/v2/files/${fileId}/download?base64=false`,
        headers: { 'AuthToken': token, 'Accept': '*/*' }, 
        responseType: 'blob' 
      };
      runRequest(req, (res) => {
        if (res.data) {
          // create file link in browser's memory
          const href = URL.createObjectURL(res.data);
                
          // create "a" HTLM element with href to file & click
          const link = document.createElement('a');
          link.href = href;
          link.setAttribute('download', `${fileName}.${output}`); //or any other extension
          document.body.appendChild(link);
          link.click();
  
          // clean up "a" element & remove ObjectURL
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
        }
        removeActiveId(componentId);

      }, '', []);

      
    }

    const handleDeleteFile = (fileId, componentId) => {
      addActiveId(componentId);

      let req = { 
        method: 'delete',
        url: `${process.env.REACT_APP_IHUB_REST_URL}/api/v2/files/${fileId}`,
        headers: { 'AuthToken': token, 'Accept': '*/*' } 
      };
      runRequest(req, (res) => {
        
        removeActiveId(componentId);

      }, 'Successfully deleted the file', []);
      
    }


  useEffect(
    () => {
      if (jobId) {
        setJobRefresh(true);
        setTimeout(() => { handleJobRefresh('refreshLabel') }, 2000);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobId]
    );

    useEffect(
      () => {
        if (jobRefresh===false && jobId && !jobDone && !errorMsg) {
          //refresh it again
          setJobRefresh(true);
          setTimeout(() => { handleJobRefresh('refreshLabel') }, 2000);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [jobRefresh]
      );

    
    // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
        

    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
    );
   
   

      return (
        <React.Fragment>
          <Box sx={{ width: '100%' }}>
              <Stack
              direction="column" 
              spacing={2} 
              alignItems="left" 
              key="name-filter-stack" 
              sx={{ bgcolor: 'background.paper', 
                boxShadow: 1,
                borderRadius: 2,
                p: 2, mb: 1}}
              >
              
              {(jobId && !jobDone && !errorMsg) || working ? <LinearProgress /> : ''}
              

                {true && <Stack 
                  direction="row" 
                  spacing={2} 
                  alignItems="center" 
                  key="name-filter-stack"
                  >
                  <Typography variant="subtitle1" gutterBottom>
                      {jobId?(jobDone?'Report export successfull':(errorMsg?'ERROR':'Report export in progress...')):(working?'Creating export job...':'Please enter a file name and send it to export: ')}  
                  </Typography>
                  {!jobId && !working && fileName && <IconButton size="small" variant="outlined" color="success" title="Export" onClick={() => { handleSendToExport() }}>
                    <TransformIcon />
                  </IconButton> }
                  {jobDone && <IconButton size="small" variant="outlined" color="success" title="View job result" onClick={() => { setJobView(job) }}>
                    <VisibilityIcon />
                  </IconButton> }
                  {jobDone && job.job.actualOutputFileId && <IconButton size="small" variant="outlined" color="success" title="Download file" onClick={() => { handleDownloadFile(job.job.actualOutputFileId, 'dwnButton') }}>
                    <DownloadIcon />
                  </IconButton> }
                  {jobDone && job.job.actualOutputFileId && <IconButton size="small" variant="outlined" color="error" title="Delete file" onClick={() => { handleDeleteFile(job.job.actualOutputFileId, 'delButton') }}>
                    <DeleteForeverIcon />
                  </IconButton> }
                  <IconButton size="small" variant="outlined" color="warning" title="Refresh" onClick={() => { setJobId(''); setWorking(false); setJobDone(false); setErrorMsg('');}}>
                    <RefreshIcon />
                  </IconButton>
                  
                </Stack>}  
                {errorMsg && <React.Fragment>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography variant="subtitle1" color="error" gutterBottom>
                      {errorMsg}  
                    </Typography>
                    <IconButton size="small" variant="outlined" color="primary" title="View publication" onClick={() => { setJobView(job) }}>
                      <VisibilityIcon />
                    </IconButton>
                  </Stack>
                      
                </React.Fragment>}  
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Name"
                  type="name"
                  fullWidth
                  required
                  variant="standard" 
                  value={fileName} 
                  onChange={e => {setFileName(e.target.value)}}
                />
                <FormControl key={'select-form'} sx={{ m: 1, minWidth: 200 }} size="small">
                  <InputLabel id="select-format">Format</InputLabel>
                  <Select
                    labelId="select-format"
                    id="select-sel-format"
                    value={output}
                    label="Format"
                    onChange={(e) => {setOutput(e.target.value)}} 
                  >
                    
                      <MenuItem key={'pdf'} value={'PDF'}>{'PDF'}</MenuItem>
                      <MenuItem key={'xls'} value={'XLS'}>{'MS Excel (xls)'}</MenuItem>
                      <MenuItem key={'xlsx'} value={'XLSX'}>{'MS Excel (xlsx)'}</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
          </Box>
          
            <TextContentDisplay 
                  jsonValue={jobView}
                  setJsonValue={setJobView} 
                  textValue={''} 
                  setTextValue={()=>{}}
                />
          </React.Fragment>
      );
  }
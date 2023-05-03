import * as React from 'react';
import { useState } from 'react';

//FOR LOADING STUFF AT INIT
import { useEffect } from 'react';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

// MUI components
import { 
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Switch,
  InputLabel,
  IconButton,
  Typography,
  Stack
} from '@mui/material';
import ReportList from './ReportList';

 

export default function IhubView(props) {
  const { runRequest, token } = props;

  const [message, setMessage] = useState('');
  const [bookmark, setBookmark] = useState('');
  const [parameters, setParameters] = useState([]); //the parameters result from rest
  const [paramValues, setParamValues] = useState([]); //the selected values for parameters
  const [paramList, setParamList] = useState([]); //for the list of values
  const [interactivity, setInteractivity] = useState(false);
  const [enableToolbar, setEnableToolbar] = useState(true);

  const [showSelect, setShowSelect] = useState(false);

  const [repPath, setRepPath] = useState('');
  const [repId, setRepId] = useState('');

  const [tmpRepPath, setTmpRepPath] = useState('');
  const [tmpRepId, setTmpRepId] = useState('');
  const [repSelected, setRepSelected] = useState(false);




  const jsInject = () => {
    
      var m = document.createElement("script");
      m.setAttribute('type','text/javascript');
      m.setAttribute('src', `${process.env.REACT_APP_IHUB_URL}/iportal/jsapi`);
      m.setAttribute('id', `ihub_view_js`);
      //remote loading
      console.log("Adding js file: " + `${process.env.REACT_APP_IHUB_URL}/iportal/jsapi`);
      document.getElementsByTagName("head")[0].appendChild(m);
    
  }

  const jsEject = () => {
    
    let remainingTags = true;
    

   
      //unloading the ones I added
      console.log("Removing js file: ihub_view_js");
      
      var elem = document.getElementById("ihub_view_js");
      while (elem) {
        elem.parentNode.removeChild(elem);
        elem = document.getElementById("ihub_view_js");
      }
      
    
  }

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function componentWait() {
    console.log("Waiting for component to be  ready...");
  
    while (!window.actuate) {
      console.log('Not ready');
      await sleep(500);
    }
    console.log("Actuate loaded");

    window.actuate.load('viewer');
	  var reqOps = new window.actuate.RequestOptions( );
	  reqOps.setRepositoryType('Enterprise');
	  reqOps.setVolume('Default Volume');
	  reqOps.setCustomParameters({});
    if (!window.actuate.isInitialized( )){ 
	    window.actuate.initialize( `${process.env.REACT_APP_IHUB_URL}/iportal`,reqOps==undefined?null:reqOps, process.env.REACT_APP_IHUB_USER, process.env.REACT_APP_IHUB_PASSWORD, loadReport );
      console.log('Actuate initialize called with: ' + process.env.REACT_APP_IHUB_USER +  ' / ' + process.env.REACT_APP_IHUB_PASSWORD);
    } else {
      loadReport();
      console.log('Viewer called successfully');
    }
    

    
  }
	
	

  const loadReport = () => {
    if (!repPath || !repId) return;
    let viewer1 = window.actuate.getViewer('ihub-report-content');
    if (!viewer1) {
      viewer1 = new window.actuate.Viewer( 'ihub-report-content' );
    }
    console.log('Setting report name: ' + repPath);
    
		viewer1.setReportDesign(repPath);
		var options = new window.actuate.viewer.UIOptions( );

    //create parameters from input array
    
    var parameterValues=[];
    for(let i=0; i<parameters.length; i++) {
      var param=new window.actuate.viewer.impl.ParameterValue();
      param.setName(parameters[i].name);
      if(paramValues[i]!==null) {
          param.setValue(paramValues[i]);
      } else {
        param.setValueIsNull(true);
      }
      parameterValues.push(param);
      }
    viewer1.setParameterValues(parameterValues);
    viewer1.setReportletBookmark(bookmark);
    
    
    //enable-disable toolbar
    options.enableToolBar(enableToolbar);


		viewer1.setUIOptions( options );
    viewer1.setSize(window.innerWidth * 0.74, window.innerHeight * 0.7);
   
    if (interactivity) {
      viewer1.submit(function() {viewer1.enableIV();});
      console.log('Submit with IV');
    } else {
      viewer1.submit(function() {viewer1.disableIV();});
      console.log('Submit without IV');
    }
    setRepSelected(false);
		
  }

  const downloadReport = () => {
    let viewer1 = window.actuate.getViewer('ihub-report-content');
    
    if (!viewer1) {
      return;
    }
    //console.log('Client height: ' + viewer1.getClientHeight() + ', width: ' + viewer1.getClientWidth());
    //setRepHeight(viewer1.getClientHeight());
    //setRepWidth(viewer1.getClientWidth());
    
		viewer1.downloadReport('pdf', '', null);
    
		
  }

  const resizeReport = () => {
    let viewer1 = window.actuate.getViewer('ihub-report-content');
    if (viewer1) {
      viewer1.setSize(300, 300);
      viewer1.submit();
    }
  }

  const setSelectedReport = (obj, path) => {
    setTmpRepId(obj.id ?? '');
    setTmpRepPath(`/${path.join('/')}${path.length>0 ? '/' : ''}${obj.name}` );
  }

  const handleShowSelect = () => {
    setShowSelect(true);
    setTmpRepId('');
    setTmpRepPath('');
  }

  const handleSelectNewReport = () => {
    setRepId(tmpRepId);
    setRepPath(tmpRepPath);
    setRepSelected(true);
    setShowSelect(false);
    getReportParameters(tmpRepId);
  }

  const getDefautlValue = (item) => {
    switch (item.dataType) {
      case 'Double':
        return 0;
      case 'Integer':
        return 0;
      case 'Boolean':
        return false;
      case 'String':
        return '';
      default:
        return null;
    }
  }

  const getReportParameters = (repId) => {
    let req = { 
      method: 'get', 
      url: `${process.env.REACT_APP_IHUB_REST_URL}/api/v2/visuals/${repId}/parameters?definitionOnly=false`, 
      headers: { 'AuthToken': `${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.status===200) {
        setParameters(res.data.parameters ?? []);
        
        //if no report parameters or all required parameters have default values, run the report
    
        if (res.data.parameters && res.data.parameters.length>0) {
          let outNeedsAttention = false;
          let pVals = [];
          let pList = [];
          for (let i=0; i<res.data.parameters.length; i++) {
            pVals.push(res.data.parameters[i].defaultValue ?? getDefautlValue(res.data.parameters[i]));
            if (res.data.parameters[i].isRequired===true && !res.data.parameters[i].defaultValue) {
              outNeedsAttention = true;
            }
            if (res.data.parameters[i].isDynamicSelectionList==true) {
              if (res.data.parameters[i].selectNameValueList) {
                //static
                let vals = res.data.parameters[i].selectNameValueList.selectNameValue;
                let vOut = [];
                for (let v=0; v<vals.length; v++) {
                  vOut.push(vals[v].name);
                }
                pList.push(vOut.join('|'));
              } else {
                //dynamic
                pList.push('Loading...');
              }
            } else {
              pList.push('');
            }
            
          }
          setParamValues(pVals);
          setParamList(pList);
          setRepSelected(outNeedsAttention);
        } else {
          setRepSelected(false);
        }
      } else {
        setParameters([]);
        setMessage('GetParameters call failed, please check logs.');
      }
    


    }, '', []);

  }

  const getParamList = (index) => {
    let cascadingGroupName = `${parameters[index].group ? `&cascadingGroupName=${encodeURIComponent(parameters[index].group)}` : ''}`;
    let precedingParamValues = `${parameters[index].cascadingParentName ? `&precedingParamValues=${encodeURIComponent(`{"ParameterValue":[{"Name":"${parameters[index].cascadingParentName}", "Value":"${paramValues[parameters.findIndex((obj) => {return obj.name==parameters[index].cascadingParentName})]}"}]}`)}` : ''}`;
    

    let req = { 
      method: 'get', 
      url: `${process.env.REACT_APP_IHUB_REST_URL}/api/v2/visuals/${repId}/parameters/picklist?paramName=${parameters[index].name}${cascadingGroupName}${precedingParamValues}`, 
      headers: { 'AuthToken': `${token}`, 'Accept': '*/*' }
    };
    runRequest(req, (res) => {
      //console.log(res);
      if (res.status===200) {
        let tmpArr = [...paramList];
        let newList = [];
        for (let i=0; i<res.data.nameValuePair.length; i++) {
          newList.push(res.data.nameValuePair[i].name);
        }
        tmpArr.splice(index, 1, newList.join('|'));
        setParamList(tmpArr);
        
      } else {
        setMessage('GetPicklist for parameter index ' + index + ' call failed, please check logs.');
      }
    


    }, '', []);

  }

  const setParamValueForIndex = (index, value) => {
    let tmpArr = [...paramValues];
    tmpArr.splice(index,1,value);
    setParamValues(tmpArr);

    for (let i=0; i<parameters.length; i++) {
      if (parameters[i].cascadingParentName === parameters[index].name) {
        getParamList(i);
      }
    }
        
  }

  const actuateRefresh = () => {
    window.actuate.logout(`${process.env.REACT_APP_IHUB_URL}/iportal`, null, null, null);
    window.actuate.load('viewer');
    var reqOps = new window.actuate.RequestOptions( );
	  reqOps.setRepositoryType('Enterprise');
	  reqOps.setVolume('Default Volume');
	  reqOps.setCustomParameters({});
    
	    window.actuate.initialize( `${process.env.REACT_APP_IHUB_URL}/iportal`,reqOps==undefined?null:reqOps, process.env.REACT_APP_IHUB_USER, process.env.REACT_APP_IHUB_PASSWORD, loadReport );
      console.log('Actuate reinitialize called with: ' + process.env.REACT_APP_IHUB_USER +  ' / ' + process.env.REACT_APP_IHUB_PASSWORD);
    
  }

  // ADD HOOK ALLOWING TO RUN CODE ONCE COMPONENT READY
  useEffect(
    () => {
      console.log('iHub loading.');
      jsInject();
      componentWait();


      return () => {
        console.log('iHub unloading.');
        jsEject();
      }
       
    },[]
    );

  // ADD HOOK ALLOWING TO RUN CODE ONCE TOKEN READY
  useEffect(
    () => {
      setMessage(token ? '' : 'No token yet.');
       
    },[token]
    );

  useEffect(
    () => {
      if (!repSelected && repId && repPath) {
        loadReport();
      }
        
    },[repSelected]
    );

  useEffect(
    () => {
      for (let i=0; i<paramList.length; i++) {
        if (paramList[i]==='Loading...') {
          getParamList(i);
        }
      }      
        
    },[paramList]
    );
  

  return (
    <React.Fragment>
        {<React.Fragment>
          <Stack direction={'column'} spacing={1}>
            
            {message && <Typography 
              variant="button" 
              display="block" 
              gutterBottom 
              sx={{
                wordWrap: 'break-word',
                color: 'red'
                }}>
              {message}
            </Typography> }
            <Stack direction={'row'} spacing={1}>
                <Box key={'left panel'} sx={{width: '25vw', p: 2}}>
                  {<Button onClick={() => { handleShowSelect() }} variant="contained" color="primary">
                            Select a report definition
                        </Button>}
                  {repId && repPath && <Stack direction={'column'} spacing={1}>
                    <Box>
                      <FormControlLabel
                      control={
                        <Switch checked={interactivity} onChange={(e) => { setInteractivity (e.target.checked);  }} name="interactive"/>
                      }
                      label="Enable interactivity"/>
                    </Box>
                    <Box>
                      <FormControlLabel
                      control={
                        <Switch checked={enableToolbar} onChange={(e) => { setEnableToolbar (e.target.checked);  }} name="enableToolbar"/>
                      }
                      label="Enable toolbar"/>
                    </Box>
                    
                    <FormControl sx={{ m: 0, minWidth: 200 }} size="small">
                      <InputLabel id="select-bookmark">Bookmark</InputLabel>
                      <Select
                        labelId="select-bookmark"
                        id="select-sel-bk"
                        value={bookmark}
                        label="Bookmark"
                        onChange={(e) => {setBookmark(e.target.value)}} 
                      >
                        <MenuItem key={'none'} value={''}>{'(none)'}</MenuItem>
                        <MenuItem key={'average'} value={'average'}>{'average'}</MenuItem>
                        <MenuItem key={'percentage'} value={'percentage'}>{'percentage'}</MenuItem>
                      </Select>
                    </FormControl>
                    {parameters.map((parameter, index) => (
                        <Stack key={`parameterstack_${index}`} direction={'row'} spacing={1}>
                          <Box sx={{minWidth: 200, m:1}}>
                            <Typography>{parameter.displayName}</Typography>  
                          </Box>
                          
                          {parameter.isDynamicSelectionList===true ? 
                             <FormControl key={parameter.name} sx={{ m: 1, minWidth: 200 }} size="small">
                              <InputLabel id="select-value">Value</InputLabel>
                              <Select
                                labelId="select-value"
                                id="select-sel-val"
                                value={paramValues[index]}
                                label="Value"
                                onChange={(e) => {setParamValueForIndex(index, e.target.value)}} 
                              >
                                {paramList[index].split('|').map((parVal) => (
                                  <MenuItem key={index + parVal} value={parVal}>{parVal}</MenuItem>
                                  )
                                )}
                              </Select>
                            </FormControl>
                           : 
                           <TextField
                            margin="dense"
                            id="parValue"
                            label="Value"
                            type="value"
                            fullWidth
                            variant="standard"
                            value = {paramValues[index]}
                            onChange={e => {setParamValueForIndex(index, e.target.value)}}
                          />
                           }
                        </Stack>
                          ))}
                    <Stack direction={'row-reverse'} >
                      <IconButton
                        aria-label="download"
                        onClick={() => {actuateRefresh()}}
                        disabled={false}
                      >
                        <CloudDownloadIcon/>
                      </IconButton>
                      <IconButton
                        aria-label="refresh"
                        onClick={() => { loadReport()}}
                        disabled={false}
                      >
                        <CloudSyncIcon/>
                      </IconButton>
                    </Stack>
                  </Stack>}
                </Box>
                <Box key={'report panel'} 
                  sx={{
                    width: '74vw', 
                    height: '70vh', 
                    border: '1px solid black',
                    borderRadius: 2
                    }}>
                      {(!repId || !repPath) && <Typography>
                        No report definition selected yet.
                      </Typography> }
                      {(repSelected) && <Typography>
                        Enter parameters and click run.
                      </Typography> }
                      
                      {repId && repPath && !repSelected && <div style={{border: '1px solid red'}} id="ihub-report-content"></div>}
                    
                </Box>

            </Stack>
            
            
          </Stack>
          
          
          </React.Fragment>}
          <Dialog
              open={showSelect} onClose={() => {}} maxWidth={'xl'} fullWidth>
              <DialogTitle>Select a report definition</DialogTitle>
              <DialogContent>
                <ReportList runRequest={runRequest} token={token} outSelected={(object, path) => setSelectedReport(object, path)} />
                  
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => { handleSelectNewReport()  }} disabled={(tmpRepId==='' || tmpRepPath==='')} variant="contained" color="primary">
                      Select
                  </Button>
                  <Button onClick={() => { setShowSelect(false) }} variant="contained" color="primary">
                      Close
                  </Button>
              </DialogActions> 
          </Dialog>
  
    </React.Fragment>
  );
}

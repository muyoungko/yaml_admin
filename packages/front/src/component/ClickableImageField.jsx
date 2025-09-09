import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogActions,
    Button, Box, 
} from '@mui/material';

import {
    ImageField,
    useRecordContext,
} from "react-admin";


/**
 * 

    다음 몇가지 형태 지원 가능하도록 

    list 앱에서 올린 동영상 [
    {
        img: {
            image: 'media/1697530420912/860.jpg',
            video: 'media/1697530420912/859.mp4',
        }
    }
    ]
    list 앱에서 올린 공지 [
    {
        img: {
            image: 'media/1697530420912/854.jpg',
            src: 'https://d3cg715xjqsg72.cloudfront.net/media/1697530420912/854.jpg',
            url: 'https://d3cg715xjqsg72.cloudfront.net/media/1697530420912/854.jpg'
        }
    }
    ]
    list 웹에서 올린 공지 [
    {
        img: {
            src: 'media/public/852.jpeg',
            title: '17072135317655C49580C-50D1-40D9-A435-0D99B202691E.jpeg'
        }
    }
    ]

    emergency 
    media:[
        {
            image: 'media/public/852.jpeg',
            video: 'media/public/853.mp4',
        }
    ]
 */
const ClickableImageField = ({label, source, width, height}) => {
    
    const [mediaType, setMediaType] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageUrlSource, setImageUrlSource] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [open, setOpen] = useState(false);
    const [sx] = useState({width: (width?width:'300px'), height:(height?height:'300px'), background:'#ededed', display:'flex'});
    const record = useRecordContext();
    useEffect(()=>{
        if(!record)
            return
        if(!source)
            return

        const ss = source.split('.')
        let v = record
        ss.map(m=>{
            v = v[m]
        })

        if(v == null)
            return 

        let resultImageSource = ''
        let imageUrl = ''
        
        if(typeof v == 'object') {
            imageUrl = v.image_preview
            if(v.video) {
                setVideoUrl(v.video_preview)
                setMediaType('video')
            } else
                setMediaType('image')

            resultImageSource = source + '.image_preview'
        } else if(typeof v == 'string') {
            if(v.endsWith('.mp4')) {
                setVideoUrl(v)
                setMediaType('video')
            } else
                setMediaType('image')
            imageUrl = v
            resultImageSource = ss
        }

        //console.log('ClickableImageField', v, source, resultImageSource, imageUrl)
        setImageUrl(imageUrl)
        setImageUrlSource(resultImageSource)
    }, [source, record])

    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }    

    return (
    <Box>
        <Box sx={sx}>
            {imageUrl && <img width='100%'
                height='100%' 
                style={{cursor: 'pointer', objectFit: 'contain'}}
                src={imageUrl} 
                onClick={e=>{
                    handleOpen()
                    e.stopPropagation()
                }}
            />}
        </Box>
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth={true}
            maxWidth={'lg'}
        >
            <DialogContent>
                <Box sx={{ 
                    textAlign:'center'}}>
                    {mediaType == 'video' ? (
                        <div style={{position: "relative", width: "100%", paddingTop: "56.25%", overflow: "hidden"}}>
                            <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: "100%"}}>
                                <video style={{ width:'100%', height:'100%'}} controls><source src={videoUrl} type="video/mp4"/></video>
                            </div>
                        </div>
                    ) : (
                        <img src={imageUrl} style={{ maxHeight: '100vh' }} />
                    )}
                    
                </Box>
                <DialogActions>
                    <Button onClick={handleClose}>
                        닫기
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    </Box>
)};



export default ClickableImageField;
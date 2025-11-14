
import { Box, Stack, Paper } from '@mui/material';
import EntityTreeView from '../component/EntityTreeView';

const DynamicLayout = ({ entity, custom, children }) => {
    return (
        <Stack direction={'row'} spacing={1}>
            {entity.layout?.left && <Box padding={1}>
                {entity.layout.left.map((component, index) => {
                    if (component.component == 'tree')
                        return <Paper sx={{marginTop: 1, padding: 1}}>
                                <EntityTreeView key={index} component={component} custom={custom} />
                            </Paper>
                    else
                        return <>Unknown component: {component.component}</>
                })}
            </Box>}
            <Box width={'100%'}>
                {children}
            </Box>
        </Stack>

    )
}

export default DynamicLayout;
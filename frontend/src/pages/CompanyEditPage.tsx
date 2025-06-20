import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Box, Button, Grid, Paper, TextField, Typography, MenuItem, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const companyTypes = [
  { value: 'ООО', label: 'ООО' },
  { value: 'АО', label: 'АО' },
];
const contactTypes = [
  { value: 'Телефон', label: 'Телефон' },
  { value: 'Email', label: 'Email' },
];

type Contact = { type: string; value: string };
type ContactPerson = { firstName: string; lastName: string; position: string; contacts: Contact[] };

type FormData = {
  name: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  director: string;
  email: string;
  companyType: string;
  bankName: string;
  checkingAccount: string;
  correspondentAccount: string;
  bik: string;
  contactPersons: ContactPerson[];
};

const defaultValues: FormData = {
  name: '', inn: '', kpp: '', ogrn: '', address: '', director: '', email: '', companyType: '',
  bankName: '', checkingAccount: '', correspondentAccount: '', bik: '',
  contactPersons: [
    { firstName: '', lastName: '', position: '', contacts: [{ type: '', value: '' }] },
  ],
};

const CompanyEditPage: React.FC<{ isEdit: boolean }> = ({ isEdit }) => {
  const navigate = useNavigate();
  const { control, handleSubmit, register } = useForm<FormData>({ defaultValues });
  const { fields: contactPersons, append: appendPerson, remove: removePerson } = useFieldArray({ control, name: 'contactPersons' });

  const onSubmit = (data: FormData) => {
    // TODO: интеграция с backend
    alert(JSON.stringify(data, null, 2));
    navigate('/companies');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" gutterBottom>Редактирование компании</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Название компании *" fullWidth {...register('name')} /></Grid>
          <Grid item xs={12} sm={3}><TextField label="ИНН *" fullWidth {...register('inn')} /></Grid>
          <Grid item xs={12} sm={3}><TextField label="КПП *" fullWidth {...register('kpp')} /></Grid>
          <Grid item xs={12} sm={4}><TextField label="ОГРН *" fullWidth {...register('ogrn')} /></Grid>
          <Grid item xs={12} sm={8}><TextField label="Адрес *" fullWidth {...register('address')} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Директор" fullWidth {...register('director')} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Телефон" fullWidth {...register('email')} /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Тип компании *" select fullWidth {...register('companyType')}>
              {companyTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Банковские реквизиты</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Название банка" fullWidth {...register('bankName')} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Расчетный счет" fullWidth {...register('checkingAccount')} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Корреспондентский счет" fullWidth {...register('correspondentAccount')} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="БИК" fullWidth {...register('bik')} /></Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Контактные лица</Typography>
        {contactPersons.map((person, idx) => (
          <Box key={person.id} sx={{ mb: 2, border: '1px solid #eee', borderRadius: 2, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}><TextField label="Имя *" fullWidth {...register(`contactPersons.${idx}.firstName` as const)} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Фамилия *" fullWidth {...register(`contactPersons.${idx}.lastName` as const)} /></Grid>
              <Grid item xs={12} sm={3}><TextField label="Должность" fullWidth {...register(`contactPersons.${idx}.position` as const)} /></Grid>
              <Grid item xs={12} sm={1}>
                <IconButton color="error" onClick={() => removePerson(idx)}><DeleteIcon /></IconButton>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <ContactList control={control} register={register} nestIndex={idx} />
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={() => appendPerson({ firstName: '', lastName: '', position: '', contacts: [{ type: '', value: '' }] })}>
          Добавить контактное лицо
        </Button>
      </Paper>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/companies')}>Отмена</Button>
        <Button variant="contained" type="submit">Сохранить</Button>
      </Box>
    </form>
  );
};

const ContactList: React.FC<any> = ({ control, register, nestIndex }) => {
  const { fields, append, remove } = useFieldArray({ control, name: `contactPersons.${nestIndex}.contacts` });
  return (
    <Box>
      {fields.map((field, k) => (
        <Grid container spacing={2} alignItems="center" key={field.id} sx={{ mb: 1 }}>
          <Grid item xs={12} sm={5}>
            <TextField label="Тип контакта" select fullWidth {...register(`contactPersons.${nestIndex}.contacts.${k}.type` as const)}>
              {contactTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField label="Значение *" fullWidth {...register(`contactPersons.${nestIndex}.contacts.${k}.value` as const)} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <IconButton color="error" onClick={() => remove(k)}><DeleteIcon /></IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddIcon />} onClick={() => append({ type: '', value: '' })}>
        Добавить контакт
      </Button>
    </Box>
  );
};

export default CompanyEditPage; 
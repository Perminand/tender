import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  Box, Button, Grid, Paper, TextField, Typography, MenuItem, IconButton, Divider, Autocomplete,
  Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

interface CompanyType {
  id: string;
  name: string;
}

const contactTypes = [
  { value: 'Телефон', label: 'Телефон' },
  { value: 'Email', label: 'Email' },
];

type Contact = { type: string; value: string };
type ContactPerson = { firstName: string; lastName: string; position: string; contacts: Contact[] };

type FormData = {
  name: string;
  legalName: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  director: string;
  phone: string;
  email: string;
  companyType: string;
  bankName: string;
  checkingAccount: string;
  correspondentAccount: string;
  bik: string;
  contactPersons: ContactPerson[];
};

const defaultValues: FormData = {
  name: '', legalName: '', inn: '', kpp: '', ogrn: '', address: '', director: '', phone: '', email: '', companyType: '',
  bankName: '', checkingAccount: '', correspondentAccount: '', bik: '',
  contactPersons: [
    { firstName: '', lastName: '', position: '', contacts: [{ type: '', value: '' }] },
  ],
};

const CounterpartyEditPage: React.FC<{ isEdit: boolean }> = ({ isEdit }) => {
  const navigate = useNavigate();
  const { control, handleSubmit, register, formState: { errors } } = useForm<FormData>({ defaultValues });
  const { fields: contactPersons, append: appendPerson, remove: removePerson } = useFieldArray({ control, name: 'contactPersons' });
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [openNewTypeDialog, setOpenNewTypeDialog] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const createNewTypeOption: CompanyType = { id: 'CREATE_NEW', name: 'Создать новый тип' };

  useEffect(() => {
    fetch('/api/company/type-companies')
      .then(res => res.json())
      .then(data => setCompanyTypes(data));
  }, []);

  const onSubmit = (data: FormData) => {
    // TODO: интеграция с backend
    alert(JSON.stringify(data, null, 2));
    navigate('/counterparties');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" gutterBottom>{isEdit ? 'Редактирование контрагента' : 'Новый контрагент'}</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Основная информация</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}><TextField label="ИНН *" fullWidth {...register('inn', { required: 'ИНН не может быть пустым', pattern: { value: /^(\d{10}|\d{12})$/, message: 'ИНН должен содержать 10 или 12 цифр' } })} error={!!errors.inn} helperText={errors.inn?.message} /></Grid>
          <Grid item xs={12} sm={3}><TextField label="КПП *" fullWidth {...register('kpp', { required: 'КПП не может быть пустым', pattern: { value: /^\d{9}$/, message: 'КПП должен содержать 9 цифр' } })} error={!!errors.kpp} helperText={errors.kpp?.message} /></Grid>
          <Grid item xs={12} sm={4}><TextField label="ОГРН *" fullWidth {...register('ogrn', { required: 'ОГРН не может быть пустым', pattern: { value: /^(\d{13}|\d{15})$/, message: 'ОГРН должен содержать 13 или 15 цифр' } })} error={!!errors.ogrn} helperText={errors.ogrn?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Название *" fullWidth {...register('name', { required: 'Название компании не может быть пустым' })} error={!!errors.name} helperText={errors.name?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Фирменное наименование" fullWidth {...register('legalName')} /></Grid>
          <Grid item xs={12} sm={8}><TextField label="Адрес *" fullWidth {...register('address', { required: 'Адрес не может быть пустым' })} error={!!errors.address} helperText={errors.address?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Директор" fullWidth {...register('director')} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Телефон" fullWidth {...register('phone')} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Email" fullWidth {...register('email')} /></Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="companyType"
              control={control}
              rules={{ required: 'Это поле обязательно' }}
              render={({ field, fieldState: { error } }) => {
                const handleCloseDialog = () => {
                  setOpenNewTypeDialog(false);
                  setNewTypeName('');
                };

                const handleSaveNewType = async () => {
                  if (!newTypeName.trim()) return;
                  try {
                    const response = await fetch('/api/company/type-companies', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newTypeName }),
                    });
                    if (!response.ok) throw new Error('Failed to create company type');
                    const createdType: CompanyType = await response.json();
                    setCompanyTypes(prev => [...prev, createdType]);
                    field.onChange(createdType.id);
                    handleCloseDialog();
                  } catch (e) {
                    console.error("Failed to create company type:", e);
                  }
                };
                
                return (
                  <>
                    <Autocomplete
                      value={companyTypes.find(opt => opt.id === field.value) || null}
                      options={[...companyTypes, createNewTypeOption]}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(_, newValue) => {
                        if (newValue && newValue.id === 'CREATE_NEW') {
                          setOpenNewTypeDialog(true);
                        } else {
                          field.onChange(newValue ? newValue.id : null);
                        }
                      }}
                      renderOption={(props, option) => (
                        <li {...props} style={{ color: option.id === 'CREATE_NEW' ? '#1976d2' : 'inherit' }}>
                          {option.name}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Тип контрагента"
                          variant="outlined"
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                    <Dialog open={openNewTypeDialog} onClose={handleCloseDialog}>
                      <DialogTitle>Создать новый тип контрагента</DialogTitle>
                      <DialogContent>
                        <TextField
                          autoFocus
                          margin="dense"
                          label="Название типа"
                          type="text"
                          fullWidth
                          variant="standard"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseDialog}>Отмена</Button>
                        <Button onClick={handleSaveNewType}>Сохранить</Button>
                      </DialogActions>
                    </Dialog>
                  </>
                );
              }}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Банковские реквизиты</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Название банка *" fullWidth {...register('bankName', { required: 'Название банка не может быть пустым' })} error={!!errors.bankName} helperText={errors.bankName?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Расчетный счет *" fullWidth {...register('checkingAccount', { required: 'Расчетный счет не может быть пустым' })} error={!!errors.checkingAccount} helperText={errors.checkingAccount?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Корреспондентский счет *" fullWidth {...register('correspondentAccount', { required: 'Корр. счет не может быть пустым' })} error={!!errors.correspondentAccount} helperText={errors.correspondentAccount?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="БИК *" fullWidth {...register('bik', { required: 'БИК не может быть пустым', pattern: { value: /^\d{9}$/, message: 'БИК должен содержать 9 цифр' } })} error={!!errors.bik} helperText={errors.bik?.message} /></Grid>
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
        <Button variant="outlined" onClick={() => navigate('/counterparties')}>Отмена</Button>
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

export default CounterpartyEditPage; 
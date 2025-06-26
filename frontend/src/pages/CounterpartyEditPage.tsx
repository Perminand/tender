import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import {
  Box, Button, Grid, Paper, TextField, Typography, MenuItem, IconButton, Divider, Autocomplete,
  Dialog, DialogActions, DialogContent, DialogTitle, Alert, Snackbar, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { searchCompanyByInn } from '../utils/fnsApi';
import ConfirmationDialog from '../components/ConfirmationDialog';

interface CompanyType {
  id: string;
  name: string;
}

interface ContactType {
  id: any;
  name: string;
}

const contactTypes = [
  { value: 'Телефон', label: 'Телефон' },
  { value: 'Email', label: 'Email' },
];

type Contact = { type: string; value: string };
type ContactPerson = { firstName: string; lastName: string; position: string; contacts: Contact[] };

type BankDetails = {
  bankName: string;
  bik: string;
  checkingAccount: string;
  correspondentAccount: string;
};

type FormData = {
  name: string;
  legalName: string;
  shortName: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  head: string;
  phone: string;
  email: string;
  companyType: string | null;
  bankDetails: BankDetails[];
  contactPersons: ContactPerson[];
};

const defaultValues: FormData = {
  name: '', legalName: '', shortName: '', inn: '', kpp: '', ogrn: '', address: '', head: '', phone: '', email: '', companyType: null,
  bankDetails: [],
  contactPersons: [],
};

const CounterpartyEditPage: React.FC<{ isEdit: boolean }> = ({ isEdit }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { control, handleSubmit, register, formState: { errors }, setValue, watch, getValues, reset } = useForm<FormData>({ defaultValues });
  const { fields: contactPersons, append: appendPerson, remove: removePerson } = useFieldArray({ control, name: 'contactPersons' });
  const { fields: bankDetails, append: appendBankDetails, remove: removeBankDetails } = useFieldArray({ control, name: 'bankDetails' });
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [openNewTypeDialog, setOpenNewTypeDialog] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [allContactTypes, setAllContactTypes] = useState<ContactType[]>([]);
  const [isLoadingFns, setIsLoadingFns] = useState(false);
  const [fnsError, setFnsError] = useState<string | null>(null);
  const [fnsSuccess, setFnsSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [bikLoading, setBikLoading] = useState<Record<number, boolean>>({});
  const [bikErrors, setBikErrors] = useState<Record<number, string | null>>({});
  const [bankAccountdialogOpen, setBankAccountDialogOpen] = useState(false);
  const [bankAccountToDelete, setBankAccountToDelete] = useState<number | null>(null);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<number | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const createNewTypeOption: CompanyType = { id: 'CREATE_NEW', name: 'Создать новый тип' };
  const watchedInn = watch('inn');

  const watchedCompanyTypeId = useWatch({ control, name: 'companyType' });
  const isIp = React.useMemo(() => {
    if (!watchedCompanyTypeId) return false;
    const currentType = companyTypes.find(t => t.id === watchedCompanyTypeId);
    return currentType?.name.toLowerCase().includes('индивидуальный предприниматель') ?? false;
  }, [watchedCompanyTypeId, companyTypes]);

  useEffect(() => {
    fetch('/api/company/type-companies')
      .then(res => res.json())
      .then(data => setCompanyTypes(data))
      .catch(error => {
        console.error('Ошибка при загрузке типов компаний:', error);
        setCompanyTypes([]);
      });
    
    fetch('/api/contact-types')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setAllContactTypes(Array.isArray(data) ? data : []))
      .catch(error => {
        console.error('Ошибка при загрузке типов контактов:', error);
        setAllContactTypes([]);
      });
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      fetch(`/api/companies/${id}`)
        .then(res => res.json())
        .then((data) => {
          const formData: FormData = {
            name: data.name || '',
            legalName: data.shortName || '',
            shortName: data.shortName || '',
            inn: data.inn || '',
            kpp: data.kpp || '',
            ogrn: data.ogrn || '',
            address: data.address || '',
            head: data.director || '',
            phone: data.phone || '',
            email: data.email || '',
            companyType: data.companyType?.id || null,
            bankDetails: data.bankDetails && data.bankDetails.length > 0 ? data.bankDetails : [],
            contactPersons: data.contactPersons ? data.contactPersons.map(person => ({
              ...person,
              contacts: person.contacts ? person.contacts.map(contact => ({
                type: contact.contactType?.name || contact.type || '',
                value: contact.value || ''
              })) : []
            })) : []
          };
          if (formData.bankDetails.length > 0) {
            setShowBankDetails(true);
          }
          reset(formData);
        });
    }
  }, [id, isEdit, reset]);

  useEffect(() => {
    if (!isEdit) {
      const params = new URLSearchParams(location.search);
      const shortNameFromQuery = params.get('shortName');
      if (shortNameFromQuery) {
        setValue('shortName', shortNameFromQuery);
        setValue('legalName', shortNameFromQuery);
      }
      const nameFromQuery = params.get('name');
      if (nameFromQuery) {
        setValue('name', nameFromQuery);
      }
    }
  }, [isEdit, location.search, setValue]);

  const handleFetchFnsData = async () => {
    if (!watchedInn || watchedInn.length < 10) {
      setFnsError('Введите корректный ИНН (минимум 10 цифр)');
      return;
    }

    setIsLoadingFns(true);
    setFnsError(null);

    try {
      const companyData = await searchCompanyByInn(watchedInn);
      setValue('name', companyData.name || '');
      setValue('legalName', companyData.shortName || '');
      setValue('shortName', companyData.shortName || '');
      setValue('ogrn', companyData.ogrn || '');
      setValue('kpp', companyData.kpp || '');
      setValue('address', companyData.address || '');
      setValue('head', companyData.head || '');
      setValue('phone', companyData.phone || '');
      setValue('email', companyData.email || '');
      if (companyData.legalForm) {
        let foundType = companyTypes.find(
          (type) => type.name.toUpperCase() === companyData.legalForm?.toUpperCase()
        );
        if (!foundType && companyData.legalForm.trim()) {
          try {
            const response = await fetch('/api/company/type-companies', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: companyData.legalForm }),
            });
            if (response.ok) {
              const createdType: CompanyType = await response.json();
              setCompanyTypes(prev => [...prev, createdType]);
              foundType = createdType;
            } else {
              console.error("Failed to auto-create company type");
            }
          } catch (e) {
            console.error("Error auto-creating company type:", e);
          }
        }
        if (foundType) {
          setValue('companyType', foundType.id);
        }
      }
      setFnsSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setFnsError(error.message);
      } else {
        setFnsError('Неизвестная ошибка при получении данных');
      }
    } finally {
      setIsLoadingFns(false);
    }
  };

  const handleBikBlur = async (index: number) => {
    const bik = getValues(`bankDetails.${index}.bik`);
    setBikErrors(prev => ({ ...prev, [index]: null }));
    if (!bik || bik.length !== 9) {
      setValue(`bankDetails.${index}.bankName`, '');
      setValue(`bankDetails.${index}.correspondentAccount`, '');
      return;
    }
    setBikLoading(prev => ({ ...prev, [index]: true }));
    try {
      const response = await fetch(`/api/banks/bik/${bik}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Банк не найден');
        }
        throw new Error('Ошибка сервера');
      }
      const data: BankDetails = await response.json();
      setValue(`bankDetails.${index}.bankName`, data.bankName, { shouldValidate: true });
      setValue(`bankDetails.${index}.correspondentAccount`, data.correspondentAccount, { shouldValidate: true });
    } catch (error) {
      if (error instanceof Error) {
        setBikErrors(prev => ({ ...prev, [index]: error.message }));
      }
    } finally {
      setBikLoading(prev => ({ ...prev, [index]: false }));
    }
  };

    const onSubmit = async (data: FormData) => {
        const url = isEdit ? `/api/companies/${id}` : '/api/companies';
        const method = isEdit ? 'PUT' : 'POST';

        const payload = {
            ...data,
            typeId: data.companyType,
            director: data.head,
            contactPersons: data.contactPersons.map(person => ({
                ...person,
                contacts: person.contacts.map(contact => {
                    const contactTypeObject = allContactTypes.find(ct => ct.name === contact.type);
                    
                    return {
                        value: contact.value,
                        contactType: {
                            id: contactTypeObject?.id,
                            name: contactTypeObject?.name || contact.type
                        }
                    };
                })
            }))
        };
        // @ts-ignore
        delete payload.head;
        // @ts-ignore
        delete payload.companyType;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                setSaveError(`Не удалось сохранить контрагента. ${errorText}`);
                return;
            }
            navigate('/counterparties');
        } catch (error) {
            if (error instanceof Error) {
                setSaveError(error.message);
            } else {
                setSaveError('Произошла неизвестная ошибка');
            }
        }
    };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" gutterBottom>{isEdit ? 'Редактирование контрагента' : 'Новый контрагент'}</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Основная информация</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField 
                InputLabelProps={{ shrink: !!watch('inn') }}
                label="ИНН *" 
                fullWidth 
                {...register('inn', { 
                  required: 'ИНН не может быть пустым', 
                  pattern: { value: /^(\d{10}|\d{12})$/, message: 'ИНН должен содержать 10 или 12 цифр' } 
                })} 
                error={!!errors.inn} 
                helperText={errors.inn?.message}
                disabled={isEdit}
              />
              {!isEdit && (
                <Button
                  variant="outlined"
                  onClick={handleFetchFnsData}
                  disabled={isLoadingFns || !watchedInn || watchedInn.length < 10}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  {isLoadingFns ? <CircularProgress size={20} /> : <SearchIcon />}
                </Button>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField 
              InputLabelProps={{ shrink: !!watch('kpp') }} 
              label={isIp ? "КПП" : "КПП *"} 
              fullWidth 
              {...register('kpp', { 
                required: isIp ? false : 'КПП не может быть пустым', 
                pattern: { value: /^\d{9}$/, message: 'КПП должен содержать 9 цифр' } 
              })} 
              error={!!errors.kpp} 
              helperText={errors.kpp?.message} 
              disabled={isIp}
            />
          </Grid>
          <Grid item xs={12} sm={4}><TextField InputLabelProps={{ shrink: !!watch('ogrn') }} label="ОГРН *" fullWidth {...register('ogrn', { required: 'ОГРН не может быть пустым', pattern: { value: /^(\d{13}|\d{15})$/, message: 'ОГРН должен содержать 13 или 15 цифр' } })} error={!!errors.ogrn} helperText={errors.ogrn?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField InputLabelProps={{ shrink: !!watch('name') }} label="Название *" fullWidth {...register('name', { required: 'Название компании не может быть пустым' })} error={!!errors.name} helperText={errors.name?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField InputLabelProps={{ shrink: !!watch('legalName') }} label="Фирменное наименование" fullWidth {...register('legalName')} /></Grid>
          <Grid item xs={12} sm={6}><TextField InputLabelProps={{ shrink: !!watch('shortName') }} label="Краткое наименование" fullWidth {...register('shortName')} /></Grid>
          <Grid item xs={12} sm={6}><TextField InputLabelProps={{ shrink: !!watch('address') }} label="Адрес *" fullWidth {...register('address', { required: 'Адрес не может быть пустым' })} error={!!errors.address} helperText={errors.address?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField InputLabelProps={{ shrink: !!watch('head') }} label="Руководитель" fullWidth {...register('head')} /></Grid>
          <Grid item xs={12} sm={6}><TextField InputLabelProps={{ shrink: !!watch('phone') }} label="Телефон" fullWidth {...register('phone')} /></Grid>
          <Grid item xs={12} sm={6}><TextField InputLabelProps={{ shrink: !!watch('email') }} label="Email" fullWidth {...register('email')} /></Grid>
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
                  if (newTypeName.trim()) {
                    try {
                      const res = await fetch('/api/company/type-companies', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newTypeName }),
                      });
                      if (res.ok) {
                        const newType = await res.json();
                        setCompanyTypes(prev => [...prev, newType]);
                        field.onChange(newType.id);
                      }
                    } catch (e) { console.error(e); }
                    handleCloseDialog();
                  }
                };
                const selectedValue = companyTypes.find(option => option.id === field.value) || null;
                return (
                  <>
                    <Autocomplete
                      value={selectedValue}
                      onChange={(_, newValue) => {
                        if (newValue?.id === 'CREATE_NEW') {
                          setOpenNewTypeDialog(true);
                        } else {
                          field.onChange(newValue?.id || null);
                        }
                      }}
                      options={[...companyTypes, createNewTypeOption]}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Тип контрагента *"
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                    <Dialog open={openNewTypeDialog} onClose={handleCloseDialog}>
                      <DialogTitle>Создать новый тип</DialogTitle>
                      <DialogContent><TextField autoFocus margin="dense" label="Название типа" type="text" fullWidth value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} /></DialogContent>
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
        {!showBankDetails ? (
            <Button
                startIcon={<AddIcon />}
                onClick={() => {
                    setShowBankDetails(true);
                    if (bankDetails.length === 0) {
                        appendBankDetails({ bankName: '', bik: '', checkingAccount: '', correspondentAccount: '' });
                    }
                }}
                sx={{ mt: 2 }}
            >
                Добавить банковские реквизиты
            </Button>
        ) : (
            <>
                {bankDetails.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <Grid container spacing={2} sx={{ mt: index > 0 ? 2 : 0 }}>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    InputLabelProps={{ shrink: !!watch(`bankDetails.${index}.bik`) }}
                                    label="БИК *"
                                    fullWidth
                                    {...register(`bankDetails.${index}.bik`, {
                                        required: 'БИК не может быть пустым',
                                        pattern: { value: /^\d{9}$/, message: 'БИК должен содержать 9 цифр' }
                                    })}
                                    onBlur={() => handleBikBlur(index)}
                                    error={!!errors.bankDetails?.[index]?.bik || !!bikErrors[index]}
                                    helperText={errors.bankDetails?.[index]?.bik?.message || bikErrors[index]}
                                    InputProps={{
                                        endAdornment: bikLoading[index] && <CircularProgress size={20} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    InputLabelProps={{ shrink: !!watch(`bankDetails.${index}.bankName`) }}
                                    label="Название банка *"
                                    fullWidth
                                    {...register(`bankDetails.${index}.bankName`, { required: 'Название банка не может быть пустым' })}
                                    error={!!errors.bankDetails?.[index]?.bankName}
                                    helperText={errors.bankDetails?.[index]?.bankName?.message}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    InputLabelProps={{ shrink: !!watch(`bankDetails.${index}.correspondentAccount`) }}
                                    label="Корр. счет *"
                                    fullWidth
                                    {...register(`bankDetails.${index}.correspondentAccount`, { required: 'Корр. счет не может быть пустым' })}
                                    error={!!errors.bankDetails?.[index]?.correspondentAccount}
                                    helperText={errors.bankDetails?.[index]?.correspondentAccount?.message}
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    InputLabelProps={{ shrink: !!watch(`bankDetails.${index}.checkingAccount`) }}
                                    label="Расчетный счет *"
                                    fullWidth
                                    {...register(`bankDetails.${index}.checkingAccount`, { required: 'Расчетный счет не может быть пустым' })}
                                    error={!!errors.bankDetails?.[index]?.checkingAccount}
                                    helperText={errors.bankDetails?.[index]?.checkingAccount?.message}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={() => {
                                    setBankAccountToDelete(index);
                                    setBankAccountDialogOpen(true);
                                }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                        {index < bankDetails.length - 1 && <Divider sx={{ my: 2 }} />}
                    </React.Fragment>
                ))}
                <Button startIcon={<AddIcon />} onClick={() => appendBankDetails({ bankName: '', bik: '', checkingAccount: '', correspondentAccount: '' })} sx={{ mt: 2 }}>
                    Добавить счет
                </Button>
            </>
        )}
      </Paper>

      <ConfirmationDialog
          open={bankAccountdialogOpen}
          onClose={() => setBankAccountDialogOpen(false)}
          onConfirm={() => {
              if (bankAccountToDelete !== null) {
                  removeBankDetails(bankAccountToDelete);
                  setBankAccountDialogOpen(false);
                  setBankAccountToDelete(null);
              }
          }}
          title="Подтвердите удаление"
          description="Вы уверены, что хотите удалить этот банковский счет?"
      />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Контактные лица</Typography>
        {contactPersons.map((person, personIndex) => (
          <PersonFields 
            key={person.id} 
            {...{ control, register, errors, person, personIndex, allContactTypes, setAllContactTypes, onDeletePerson: () => {
              setPersonToDelete(personIndex);
              setPersonDialogOpen(true);
            } }}
          />
        ))}
        <Button startIcon={<AddIcon />} onClick={() => appendPerson({ firstName: '', lastName: '', position: '', contacts: [{ type: 'Телефон', value: '' }] })} sx={{ mt: 2 }}>
          Добавить контактное лицо
        </Button>
      </Paper>

      <ConfirmationDialog
        open={personDialogOpen}
        onClose={() => setPersonDialogOpen(false)}
        onConfirm={() => {
          if (personToDelete !== null) {
            removePerson(personToDelete);
            setPersonDialogOpen(false);
            setPersonToDelete(null);
          }
        }}
        title="Подтвердите удаление"
        description="Вы уверены, что хотите удалить это контактное лицо?"
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/counterparties')}>Отмена</Button>
        <Button type="submit" variant="contained">Сохранить</Button>
      </Box>

      {saveError && <Snackbar open={!!saveError} autoHideDuration={6000} onClose={() => setSaveError(null)}><Alert severity="error">{saveError}</Alert></Snackbar>}
      {fnsError && <Snackbar open={!!fnsError} autoHideDuration={6000} onClose={() => setFnsError(null)}><Alert severity="warning">{fnsError}</Alert></Snackbar>}
      {fnsSuccess && <Snackbar open={fnsSuccess} autoHideDuration={3000} onClose={() => setFnsSuccess(false)}><Alert severity="success">Данные по ИНН успешно загружены.</Alert></Snackbar>}
    </form>
  );
};

const PersonFields = ({ control, register, errors, person, personIndex, allContactTypes, setAllContactTypes, onDeletePerson }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `contactPersons[${personIndex}].contacts`
  });
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const handleDeleteContact = (index: number) => {
    remove(index);
    setContactDialogOpen(false);
    setContactToDelete(null);
  };

  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            label="Имя *"
            fullWidth
            {...register(`contactPersons[${personIndex}].firstName`, { required: "Имя не может быть пустым" })}
            error={!!errors.contactPersons?.[personIndex]?.firstName}
            helperText={errors.contactPersons?.[personIndex]?.firstName?.message}
          />
        </Grid>
        <Grid item xs={12} sm={3}><TextField label="Фамилия" fullWidth {...register(`contactPersons[${personIndex}].lastName`)} /></Grid>
        <Grid item xs={12} sm={3}><TextField label="Должность" fullWidth {...register(`contactPersons[${personIndex}].position`)} /></Grid>
        <Grid item xs={12} sm={2}>
          <IconButton onClick={onDeletePerson}>
            <DeleteIcon />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <ContactList 
            {...{ control, register, nestIndex: personIndex, errors, fields, append, allContactTypes, setAllContactTypes }} 
            onDeleteContact={(index) => {
              setContactToDelete(index);
              setContactDialogOpen(true);
            }}
          />
        </Grid>
      </Grid>
      <ConfirmationDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        onConfirm={() => {
          if (contactToDelete !== null) {
            handleDeleteContact(contactToDelete);
          }
        }}
        title="Подтвердите удаление"
        description="Вы уверены, что хотите удалить этот контакт?"
      />
    </Box>
  );
};

const ContactList = ({ control, nestIndex, register, errors, fields, append, remove, allContactTypes, setAllContactTypes, onDeleteContact }: any) => {
  const [openNewContactTypeDialog, setOpenNewContactTypeDialog] = useState(false);
  const [newContactTypeName, setNewContactTypeName] = useState('');
  const createNewContactTypeOption: ContactType = { id: 'CREATE_NEW', name: 'Создать новый тип' };

  const handleCloseDialog = () => {
    setOpenNewContactTypeDialog(false);
    setNewContactTypeName('');
  };

  const handleSaveNewType = async (fieldOnChange: (value: any) => void) => {
    console.log('handleSaveNewType вызвана с:', { newContactTypeName, fieldOnChange });
    if (newContactTypeName.trim()) {
      try {
        console.log('Отправляем запрос на создание типа контакта:', newContactTypeName);
        const res = await fetch('/api/contact-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newContactTypeName }),
        });
        console.log('Ответ сервера:', res.status, res.statusText);
        
        if (res.ok) {
          const newType = await res.json();
          console.log('Создан новый тип контакта:', newType);
          setAllContactTypes((prev: ContactType[]) => [...prev, newType]);
          fieldOnChange(newType.name);
        } else {
          const errorText = await res.text();
          console.error('Ошибка создания типа контакта:', errorText);
          alert(`Ошибка создания типа контакта: ${errorText}`);
        }
      } catch (e) { 
        console.error('Ошибка создания типа контакта:', e);
        alert(`Ошибка создания типа контакта: ${e}`);
      }
      handleCloseDialog();
    }
  };

  return (
    <Box>
      {fields.map((item: { id: string }, k: number) => (
        <Grid container spacing={1} key={item.id} sx={{ mb: 1 }}>
          <Grid item xs={5}>
            <Controller
              name={`contactPersons[${nestIndex}].contacts[${k}].type`}
              control={control}
              render={({ field }) => {
                const selectedValue = Array.isArray(allContactTypes) ? allContactTypes.find((option: ContactType) => option.name === field.value) || null : null;
                return (
                  <>
                    <Autocomplete<ContactType>
                      value={selectedValue}
                      onChange={(_: any, newValue: ContactType | null) => {
                        if (newValue?.id === 'CREATE_NEW') {
                          setOpenNewContactTypeDialog(true);
                        } else {
                          field.onChange(newValue?.name || '');
                        }
                      }}
                      options={Array.isArray(allContactTypes) ? [...allContactTypes, createNewContactTypeOption] : [createNewContactTypeOption]}
                      getOptionLabel={(option: ContactType) => option.name}
                      isOptionEqualToValue={(option: ContactType, value: ContactType) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Тип"
                        />
                      )}
                    />
                    <Dialog open={openNewContactTypeDialog} onClose={handleCloseDialog}>
                      <DialogTitle>Создать новый тип контакта</DialogTitle>
                      <DialogContent><TextField autoFocus margin="dense" label="Название типа" type="text" fullWidth value={newContactTypeName} onChange={(e) => setNewContactTypeName(e.target.value)} /></DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseDialog}>Отмена</Button>
                        <Button onClick={() => handleSaveNewType(field.onChange)}>Сохранить</Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Значение *"
              fullWidth
              {...register(`contactPersons[${nestIndex}].contacts[${k}].value`, { required: "Значение не может быть пустым" })}
              error={!!errors.contactPersons?.[nestIndex]?.contacts?.[k]?.value}
              helperText={errors.contactPersons?.[nestIndex]?.contacts?.[k]?.value?.message}
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={() => onDeleteContact(k)}>
                <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={() => append({ type: 'Телефон', value: '' })}>Добавить контакт</Button>
    </Box>
  );
};

export default CounterpartyEditPage;
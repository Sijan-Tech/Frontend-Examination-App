import React, { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import Modal from '../components/Modal';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion, getSubjects, generateId } from '../utils/storage';
import type { Question } from '../data/questions';

const EMPTY_FORM: Omit<Question, 'id'> = {
  subject: '',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
};

interface FormErrors {
  subject?: string;
  question?: string;
  options?: string;
  correctAnswer?: string;
}

export default function ManageQuestions() {
  const [questions, setQuestionsState] = useState<Question[]>(() => getQuestions());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Question, 'id'>>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const refresh = useCallback(() => {
    setQuestionsState(getQuestions());
  }, []);

  const existingSubjects = useMemo(() => getSubjects(), [questions]);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        !searchQuery ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject = !filterSubject || q.subject === filterSubject;
      return matchSearch && matchSubject;
    });
  }, [questions, searchQuery, filterSubject]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required.';
    if (!form.question.trim()) errs.question = 'Question text is required.';
    const filledOptions = form.options.filter((o) => o.trim());
    if (filledOptions.length < 4) errs.options = 'All 4 options are required.';
    if (!form.correctAnswer) errs.correctAnswer = 'Please select the correct answer.';
    else if (!form.options.includes(form.correctAnswer)) errs.correctAnswer = 'Correct answer must match one of the options.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      updateQuestion({ ...form, id: editingId });
    } else {
      addQuestion({ ...form, id: generateId() });
    }
    refresh();
    resetForm();
    setSaveSuccess(editingId ? 'Question updated successfully.' : 'Question added successfully.');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({ subject: q.subject, question: q.question, options: [...q.options], correctAnswer: q.correctAnswer, explanation: q.explanation ?? '' });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteQuestion(deleteTarget);
    refresh();
    setDeleteTarget(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(false);
  };

  const updateOption = (index: number, value: string) => {
    const opts = [...form.options] as [string, string, string, string];
    opts[index] = value;
    const newCorrect = form.correctAnswer && !opts.includes(form.correctAnswer) ? '' : form.correctAnswer;
    setForm((f) => ({ ...f, options: opts, correctAnswer: newCorrect }));
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" fontWeight={800}>
            Manage Questions
          </Typography>
          {!showForm && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setShowForm(true); }}>
              Add Question
            </Button>
          )}
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaveSuccess('')}>
            {saveSuccess}
          </Alert>
        )}

        {/* Form */}
        {showForm && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {editingId ? 'Edit Question' : 'Add New Question'}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              {/* Subject */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!errors.subject}>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={form.subject}
                    label="Subject"
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    displayEmpty
                  >
                    {existingSubjects.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                    <Divider />
                    <MenuItem value="__new__" disabled sx={{ fontStyle: 'italic' }}>
                      Or type a new subject below
                    </MenuItem>
                  </Select>
                  {errors.subject && <FormHelperText>{errors.subject}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="New Subject Name"
                  placeholder="e.g. Physics"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  error={!!errors.subject}
                  helperText={errors.subject ?? 'Type a new subject or select from the dropdown'}
                />
              </Grid>

              {/* Question */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Question Text"
                  multiline
                  minRows={2}
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  error={!!errors.question}
                  helperText={errors.question}
                />
              </Grid>

              {/* Options */}
              {([0, 1, 2, 3] as const).map((i) => (
                <Grid key={i} size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={`Option ${String.fromCharCode(65 + i)}`}
                    value={form.options[i]}
                    onChange={(e) => updateOption(i, e.target.value)}
                    error={!!errors.options && !form.options[i].trim()}
                    helperText={i === 0 ? errors.options : undefined}
                  />
                </Grid>
              ))}

              {/* Correct answer */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!errors.correctAnswer}>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={form.correctAnswer}
                    label="Correct Answer"
                    onChange={(e) => setForm((f) => ({ ...f, correctAnswer: e.target.value }))}
                  >
                    {form.options.map((opt, i) =>
                      opt.trim() ? (
                        <MenuItem key={i} value={opt}>
                          {String.fromCharCode(65 + i)}: {opt}
                        </MenuItem>
                      ) : null,
                    )}
                  </Select>
                  {errors.correctAnswer && <FormHelperText>{errors.correctAnswer}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Explanation */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Explanation (optional)"
                  multiline
                  minRows={2}
                  value={form.explanation}
                  onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                  placeholder="Briefly explain why the correct answer is right..."
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                {editingId ? 'Update Question' : 'Save Question'}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Subject</InputLabel>
                <Select
                  value={filterSubject}
                  label="Filter by Subject"
                  onChange={(e) => setFilterSubject(e.target.value)}
                  startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {existingSubjects.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filtered.length} of {questions.length}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Question list */}
        {filtered.length === 0 ? (
          <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary" gutterBottom>
              {questions.length === 0 ? 'No questions yet.' : 'No questions match your search.'}
            </Typography>
            {questions.length === 0 && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)} sx={{ mt: 1 }}>
                Add First Question
              </Button>
            )}
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map((q, idx) => (
              <Paper key={q.id} elevation={1} sx={{ p: 2.5, borderRadius: 2, '&:hover': { elevation: 3 } }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary.main"
                    sx={{ minWidth: 28, flexShrink: 0, pt: 0.25 }}
                  >
                    {idx + 1}.
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip label={q.subject} size="small" color="primary" variant="outlined" />
                    </Box>
                    <Typography variant="body1" fontWeight={500} gutterBottom>
                      {q.question}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {q.options.map((opt, i) => (
                        <Chip
                          key={i}
                          label={`${String.fromCharCode(65 + i)}: ${opt}`}
                          size="small"
                          color={opt === q.correctAnswer ? 'success' : 'default'}
                          variant={opt === q.correctAnswer ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                    {q.explanation && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        {q.explanation}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(q)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(q.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Container>

      <Modal
        open={!!deleteTarget}
        title="Delete Question?"
        message="This question will be permanently removed from your question bank. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        severity="error"
      />
    </Box>
  );
}

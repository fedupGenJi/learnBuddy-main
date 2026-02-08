from django.db import models


# ---------------- TEMP TABLE ----------------
class Temp(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    password = models.CharField(max_length=200)
    otp = models.CharField(max_length=10)

    def __str__(self):
        return self.email


# ---------------- USER DETAIL TABLE ----------------
class UserDetail(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=200)

    score = models.FloatField(default=0.0)

    def __str__(self):
        return self.email


# ---------------- SCORE TABLE ----------------
class Score(models.Model):
    # shared primary key with UserDetail
    id = models.OneToOneField(
        UserDetail,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="detailed_scores"  
    )

    score_algebra = models.FloatField(default=0.0)
    score_arithmetic = models.FloatField(default=0.0)
    score_probability = models.FloatField(default=0.0)
    score_growthdepr = models.FloatField(default=0.0)
    score_quadratic = models.FloatField(default=0.0)
    score_sqnseries = models.FloatField(default=0.0)

    def __str__(self):
        return f"Detailed scores for {self.id.email}"
